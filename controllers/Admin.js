
const Orders = require('../models/orderSchema.js')
const User = require('../models/userSchema.js')
const cloudinary = require('../utils/cloudinary')
const subCat= require('../models/categorySchema.js')
const Products = require('../models/productSchema.js')
const fs = require('fs')




 const dashboardData = async(req,res)=>{
    const monthlyIncome = await Orders.aggregate([
      {
        $project:{
          _id:0,
          month:{$arrayElemAt:[[
            "",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ],{
            $month:"$paidAt"
          }]},
          income:"$totalPrice" || 0
        }
      },{
        $group:{
          _id:"$month",
          total:{$sum:"$income"}
        }
      },{
        $sort:{_id:-1}
      }
    ])
  
// get new customers
    const limit = 5
    const getNewUsers = await User.find({role:"user"}).limit(limit)
    const newUserDetails = getNewUsers?.map((user)=>{return {name:user.name,email:user.email}})

const topProducts = await Products.find().sort({sold:-1}).limit(5);

// get all transactions

const transactions = await Orders.aggregate([
  {
    $project:{
      
          _id:0,
         payment_mode:"$paymentMethod",
          date:{$dateToParts:{date:  '$createdAt'}},
              amount:"$totalPrice",
              isPaid:"$isPaid",
              paidAt:"$paidAt",
              status:"$orderStatus"

    }
  },
  {
    $sort:{
      "date":-1
    }
  }
])

const allDetails ={
  getNewUsers:newUserDetails,
  monthlyIncome:monthlyIncome,
  sales:topProducts,
  transactions:transactions

}

res.status(200).send(allDetails)
}

// Get All Order Info
const ordersData = async(req,res)=>{
const ordersInfo = await Orders.aggregate([
  {
    $project:{
      _id:"$_id",
      orderId:{
        codId:"$codId",
        razorpayId:"$razorpay.razorpayOrderId"
      },
      quantity:{$sum:"$orderItems.products.quantity"},
      amount:"$totalPrice",
      isPaid:"$isPaid",
      status:'$orderStatus'
      

    }
  }
])

res.status(200).send(ordersInfo)


}
// Get Single Order Data

const singleOrderData = async(req,res)=>{

const orderId = req.params.id?.toString()

const get_single_orderInfo = await Orders.findOne({"_id":orderId})

res.status(200).send(get_single_orderInfo)

}

// Update Order
const updateSingleOrder = async(req,res)=>{
try {
  
  const orderId = req.params.id?.toString()
  const status = req.body?.status
  console.log(status)
  const getSingleOrder = await Orders.findOne({_id:orderId})

  
  let text;
  switch (status) {
    case "processing" :  
    getSingleOrder.orderStatus === "processing" ? 
    text = "Order is already in processing!" :null;
    break;

    case "shipped" :  
    getSingleOrder.orderStatus === "shipped" ? 
    text = "Order already Shipped!":
    getSingleOrder.orderStatus = "shipped"
    break;

    case "delivered" :
    getSingleOrder.orderStatus === "delivered" ? 
    text = "Order has been delivered already!":
    getSingleOrder.orderStatus = "delivered";
    getSingleOrder.isPaid = true;
    getSingleOrder.paidAt = new Date()
    break;
    default: "processing"
      
  }

if(text){
  return res.status(422).json({err:text})
}
  const updatedOrder= await getSingleOrder.save()

  if(updatedOrder){
    return res.status(201).json({updatedOrder,message:'Order Updated successfully'})

  }else{  
   return res.status(500).json({err:"server error"})

  }
} catch (error) {
  console.log(error)
}
}

// Delete Order

const delete_Single_orderInfo = async(req,res)=>{
const orderId = req.params?.id?.toString()

const delete_single_orderInfo = await Orders.deleteOne({_id:orderId})

if(delete_single_orderInfo){

  const ordersInfo = await Orders.aggregate([
    {
      $project:{
        _id:"$_id",
        orderId:{
          codId:"$codId",
          razorpayId:"$razorpay.razorpayOrderId"
        },
        quantity:{$sum:"$orderItems.products.quantity"},
        amount:"$totalPrice",
        isPaid:"$isPaid",
        status:'$orderStatus'
        
  
      }
    }
  ]
  )
  return res.status(200).json({ordersInfo})

}else{
  return res.status(500).json({err:"server error"})
}
}

// Products Section


// ADD PRODUCT


const addproduct = async(req,res)=>{
 
  const {name,price,category,subCategory,stocks,desc,size,storage}=req.body
  
  const img = req.file?.path
 
  try {  
  if(!name || !price || !category || !subCategory || !stocks || !desc || (subCategory === 'select') ||( category === 'select' )){
    return res.status(422).json({err:"Fields cannot be empty"})
  }
  
 

  if((category === 'men' || category === 'women') && !size){
    return res.status(422).json({err:"Size field cannot be empty"})
  }

  if(category === 'mobile' && !storage){
    return res.status(422).json({err:"Storage field cannot be empty"})
  }
  
  const existProducts = await Products.findOne({name:name,desc:desc})
  if(existProducts){

   const checkImageExists = await cloudinary.api.resource(existProducts.img.image_id,  {type:"upload"});

   if(checkImageExists){
    return res.status(422).json({err:"Product Image already added"})

   }
    return res.status(422).json({err:"Product already added"})

  }

  const result = await cloudinary.uploader.upload(img,{
    folder:'images'
  })

  let fields = {
    name:name,
    price:Number(price),
    img:{
      image_id:result.public_id,
      imgeUrl:result.secure_url,
      imagePath:img
    },
    category:category.toLowerCase(),
    desc:desc,
    subCategory:subCategory.toLowerCase(),
    stocks:Number(stocks)
  }

  if(fields.category === 'mobile' && storage){
    const storageArr = storage.split(',')
    const check = storageArr.every((num)=>(!isNaN(num)))
    if(!check){
      return res.status(422).json({err:"Only Numbers are allowed in storage field"})
    }else{
      fields.storage = storageArr
    }
    
  }
  if(fields.category === 'men' || fields.category === 'women' && size){
    const sizeArr = size.split(',')
    fields.size = sizeArr
  }

  const productAdded = new Products(fields)

  const saveProduct = await productAdded.save()

  if(saveProduct){
    return res.status(200).json({message:"Product created successfully"})

  }else{
    return res.status(500).json({err:"Server error"})

  }
} catch (error) {
    console.log(error)
}

}


// GET ALL PRODUCTS ADMIN
const getAllProducts = async(req,res)=>{
const getProducts = await Products.find({})

if(getProducts){
 return res.status(200).json(getProducts)
} 
else{
  return res.status(422).json({err:"No data found"})
}

}

// GET SINGLE PRODUCT 
const getSingleProduct = async(req,res)=>{
  const productId = req.params.id?.toString()

  const getProduct = await Products.findOne({_id:productId})

  if(getProduct){
   return res.status(200).json(getProduct)
  }
  else{
    return res.status(500).json({err:"Product not found!"})
  }
}

// UPDATE SINGLE PRODUCT
const updateSingleProduct = async(req,res)=>{
  try {
    
 
  const productId = req.params.id.toString()
  
  const {name,price,stocks,desc,}=req.body
  const img = req.file?.path
  
  if(!name && !price && !stocks && !desc && !img ){
    return res.status(422).json({err:"Fields cannont be empty"})

  }
 
//   const existProducts = await Products.findOne({name:name,desc:desc})
//   if(existProducts){

//    const checkImageExists = await cloudinary.api.resource(existProducts.img.image_id,  type= "upload");

//    if(checkImageExists){
//     return res.status(422).json({err:"Product Image already added"})

//    }
//     return res.status(422).json({err:"Product already added"})

//   }
 
  const result2 = await cloudinary.uploader.upload(img,{
    folder:'Updatedimages'
  })


  let fields = {
    name:name,
    price:Number(price),
    stocks:Number(stocks)
  }

  if(img){
    fields.img = {
      image_id:result2.public_id,
      imgeUrl:result2.secure_url,
      imagePath:img
    }
  }
 
  const updateProduct = await Products.updateOne({_id:productId},{$set:fields})

  if(updateProduct){
    return res.status(200).json({message:"Updated Successfully"})

  }else{
    return res.status(500).json({err:"Server error"})

  }
 } catch (error) {
    console.log(error)
  }


}


// DELETE SINGLE PRODUCT
const deleteSingleProduct = async(req,res)=>{
try {
  

const productId = req.params?.id?.toString()

const findProductById = await Products.findOne({_id:productId})
const imageId = findProductById?.img?.image_id
const imagePath = findProductById?.img?.imagePath


 fs.unlink(imagePath,(err)=>{
  if(err){
    return res.status(500).json({err:"Server error 423"})
  }
  
})

 const imageDeleted= await cloudinary.uploader.destroy(imageId)
 if(!imageDeleted){
  return res.status(422).json({err:"Image not deleted in the cloudinary"})
 }



const findandDelete = await Products.deleteOne({_id:productId})

  if(findandDelete){
    
    const getProducts = await Products.find({})
    res.status(200).json({getProducts,success:"Item deleted successfully"})

  }else{
    res.status(500).json({err:"Server Error"})

  }
} catch (error) {
  console.log(error)
}

}





const createSubCategory = async(req,res)=>{
try {
const {id} = req.params
const {menInput,womenInput,gamesInput,mobileInput}=req.body.subCategories

if(!menInput && !womenInput && !gamesInput && !mobileInput){
  return res.status(422).json({err:"Fields cannot be empty"})

}


let sub_categories;

switch (id.toString()) {

  case "men":
   sub_categories = menInput.toLowerCase().split(',')
   break;
  case "women":
   sub_categories = womenInput.toLowerCase().split(',')
   break;
  case "mobile":
   sub_categories = mobileInput.toLowerCase().split(',')
   break;
  case "games":
   sub_categories = gamesInput.toLowerCase().split(',')
   break;

  
}


const isCategoryExist = await subCat.findOne({mainCategory:id})

if(isCategoryExist){

if(isCategoryExist.subCategory.some(cat => sub_categories.includes(cat))){
  return res.status(422).json({err:`already exists in ${id}'s category`})

}

  isCategoryExist.subCategory = [...isCategoryExist.subCategory,...sub_categories]
  await isCategoryExist.save()

  return res.status(200).json({message:`New sub-category for ${id} has been created successfully`})


}else{

  const newCategory = new subCat({mainCategory:id,subCategory:sub_categories})

  const saved = await newCategory.save()

  if(saved){
    return res.status(200).json({message:`New sub-category for ${id} has been created successfully`})

  }else{
    return res.status(500).json("Server error")

  }

}

} catch (error) {
  console.log(error)
}


}

const getSubCategories = async(req,res)=>{

try {

const category = req.params.categories?.toLowerCase().toString()
const getSubCat = await subCat.findOne({mainCategory:category})

if(category === 'select'){
  return null
}
if(!getSubCat){
  return res.status(422).json({err:"Category does not exists"})

}else{
  return res.status(200).json({getSubCat})

}} catch (error) {
    console.log(error)

}

}

const deleteSubCategory = async(req,res)=>{

try {

const category = req.params.id?.toString();
const sub_cat = req.body.subCat?.toLowerCase().toString()


const getSubCats = await subCat.findOne({mainCategory:category})

if(!getSubCats){
return res.status(422).send("Something went wrong, sub-category not found")

}

const itemIndex = getSubCats.subCategory.indexOf(sub_cat)
const itemDeleted = getSubCats.subCategory.splice(itemIndex,1)

 if(itemDeleted < 0 || !itemDeleted){
return res.status(422).send("Something went wrong")

 }

 const saved = await getSubCats.save()

 if(saved){
  res.status(200).json({getSubCats})
 }
} catch (error) {
  console.log(error)
}


}


module.exports = {
  dashboardData,
 

  // Orders
   ordersData,
   singleOrderData,
   updateSingleOrder,
   delete_Single_orderInfo,

  // Products
    getAllProducts,
    getSingleProduct,
    addproduct,
    updateSingleProduct,
    deleteSingleProduct,
    // category
    createSubCategory,
    getSubCategories,
    deleteSubCategory

}
