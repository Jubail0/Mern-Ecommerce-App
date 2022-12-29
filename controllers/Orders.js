const Cart = require('../models/cartSchema.js')
const Order = require('../models/orderSchema.js');
const Products = require("../models/productSchema.js");
const Razorpay = require('razorpay')
const crypto = require('crypto')
const uniqid = require('uniqid'); 


// For Cash on Delivery
const cashOnDelivery = async(req,res)=>{
    const{fullName,
        address1,
        address2,
        city,
        state,
        pincode,
        payment}= req.body
        
    try {
       if(!fullName || !address1 ||!address2 || !city || !state || !pincode ||!payment ){
       return res.status(422).json({err:"Fill up the details"})
       }

         const cartItems = await Cart.findOne({userID:req.userID})
         
         let placedOrder ={}

          placedOrder.userId = req.userID
          placedOrder.orderItems=cartItems
          placedOrder.totalPrice=cartItems.totalPrice
          placedOrder.paymentMethod=payment
          placedOrder.isPaid=false
          placedOrder.codId = uniqid()
          placedOrder.userAddress= {fullName,
            address1,
            address2,
            city,
            state,
            pincode,}
            
    
         const newOrder = new Order(placedOrder)
         const saveOrder = await newOrder.save()

         if(saveOrder){
            const getProductsbyIDs = cartItems.products?.map((product)=> product.productId);
            const getQty = cartItems.products?.map((product)=> product.quantity)
            
            const updates = getProductsbyIDs.map((productId,index)=>({
             
             updateOne:{
                 filter:{_id:productId},
                 update:{$inc:{sold:getQty[index], stocks: - getQty[index] }}
             }
            }));
     
            const updated = await Products.bulkWrite(updates);
            
            if(!updated){
             return res.status(422).josn({err:"Something went wrong"})
            }

             cartItems.products = [];
             cartItems.totalPrice = 0;
             await cartItems.save()
            res.status(200).json({message:"Order placed Successfully."})
         }else{
            res.status(500).send("Server Error")
         }

    } catch (error) {
        console.log(error);
    }
}

// For Online Payment

// RazorPay Instance
const keyId = process.env.KEY_ID;
const keySecret = process.env.KEY_SECRET;

const razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

// Get razorPay Key

const getKey = (req,res)=>{
    res.status(200).json({key:process.env.KEY_ID})
}

// create razorpay Order

const createRazorPay_order =async(req,res)=>{
    const currency = 'INR'
   

     const {fullName,
        address1,
        address2,
        city,
        state,
        pincode,payment} = req.body

     if(!fullName || !address1 ||!address2 || !city || !state || !pincode || !payment){
      return  res.status(422).json({err:"Fill up the details"})

    }
       else{
       const cartItems = await Cart.findOne({userID:req.userID})
       const amount = cartItems.totalPrice * 100
 
   const orderCreated = await razorpayInstance.orders.create({amount,currency})
   if(!orderCreated){
    console.log("error Payment Route")

   }else{
   
    res.status(200).json(orderCreated)
   }
}

}

// Verify RazorPay Order

const verifyRazorPay_order = async(req,res)=>{
    const {razorpayPaymentId,razorpayOrderId,razorpaySignature,amount} = req.body
    const {fullName,
        address1,
        address2,
        city,
        state,
        pincode,payment} = req.body.address
    
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
    .createHmac("sha256",process.env.kEY_SECRET)
    .update(body.toString())
    .digest('hex')
    
    const isAuthentic = razorpaySignature === expectedSignature;
    
    if(isAuthentic){
     const cartItems = await Cart.findOne({userID:req.userID})
    let placedOrder ={}
    placedOrder.userId = req.userID
    placedOrder.orderItems=cartItems
    placedOrder.totalPrice= cartItems.totalPrice
    placedOrder.paymentMethod=payment
    placedOrder.isPaid=true
    placedOrder.paidAt = new Date()
    placedOrder.razorpay ={expectedSignature,razorpayPaymentId,razorpayOrderId}
    placedOrder.userAddress = {fullName,
      address1,
      address2,
      city,
      state,
      pincode,}
    
    const newOrder = new Order(placedOrder)
    const saveDetails = await newOrder.save()
    
    if(saveDetails) {
       const getProductsbyIDs = cartItems.products?.map((product)=> product.productId);
       const getQty = cartItems.products?.map((product)=> product.quantity)

       const updates = getProductsbyIDs.map((productId,index)=>({
        updateOne:{
            filter:{_id:productId},
            update:{$inc:{sold:getQty[index]}}
        }
       }));

       const updated = await Products.bulkWrite(updates);
       if(!updated){
        return res.status(422).josn({err:"Something went wrong"})
       }
        
        cartItems.products = [];
        cartItems.totalPrice = 0;
        await cartItems.save()
        res.status(200).json({message:"Order placed Successfully."})
    
    }else 
    {res.status(500).json({err:"Server Error"})}
    
    }
    else{
        res.status(500).json({err:"Payment failed"})
    }
    
    
    
    }

    // Get user's Order Details

    const myOrder = async(req,res)=>{
        try {
        const getOrderDetails = await Order.find({userId:req.userID.toString()})

        if(!getOrderDetails){
            return res.status(422).json({err:'No User found!'})
        }else{

            const details = getOrderDetails?.map((order)=>
            ({
                id:order._id,
                orderId: (order.codId && order.codId) || (order.razorpay.razorpayOrderId && order.razorpay.razorpayOrderId),
                qty:order.orderItems.products?.length,
                status:order.orderStatus,
                amount:order.totalPrice,
                created : order.createdAt


            })
            
            )

           return  res.status(200).json({details})
        }

      



        } catch (error) {
            console.log(error)
        }
    }

module.exports = {cashOnDelivery,getKey,createRazorPay_order,verifyRazorPay_order,myOrder}