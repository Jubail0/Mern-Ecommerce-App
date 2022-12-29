const Cart = require('../models/cartSchema.js')
const Products = require('../models/productSchema.js')



const addToCart = async (req, res) => {

    const USERID = req.userID
    const productID = req.body.id
    const size = req.body.size?.toLowerCase()
    const storage = req.body.storage
    const category = req.body.category
   

    if(category ==="mobile" && !storage){
    return  res.status(422).json({err:"Select the Storage"})
    }

    if(( category === "men" && !size) || (category === "women" && !size)){
    return res.status(422).json({err:"Select the size"})

    } 

    try {

        
         // IF CART IS ALREADY EXISTS.
        const cartExisted = await Cart.findOne({userID: USERID})
        const findProduct = await Products.findOne({_id: productID})

        const addProduct = {};

        if(size){
            addProduct.size = size;
        }
        if(storage){
         addProduct.storage =storage;
         
        }
        addProduct.productId = productID;
        addProduct.quantity= 1;
        addProduct.productDetails = findProduct;
        addProduct.subTotal = Number(findProduct.price)
        
        

        if (cartExisted) {
         const existProductIndex = cartExisted.products.findIndex(p => p.productId === productID)

         if (existProductIndex > -1) { // const productExisted = cartExisted.products[existProductIndex]
           return res.status(422).json({err: "Item already exists in your cart!"})
            } 

                const newProduct = await Cart.findOneAndUpdate({
                    userID: USERID
                }, { 
                    "$push": {
                        "products":addProduct}
            
                })

                if (newProduct) {
                    const addCartQuantity = cartExisted.products.length + 1
                    return res.status(200).json({message: "Item added in your the cart.", addCartQuantity: addCartQuantity})

                } else {
                    return res.status(500).json({err: "Server Error"})

                }
            

        } else {
             
            try {
                
                const newCart = new Cart({
                    userID: USERID,
                    products: [
                       addProduct
                    ]
                })
                const cartAdded = await newCart.save()

                if (cartAdded) {
                  return  res.status(200).json({success: true, message: "Item added in the cart.", addCartQuantity: cartAdded.products.length})

                } else {
                  return  res.status(500).json({success: false, err: "Server Error"})

                }
            } catch (error) {
                console.log(error)

            }

        }
    } catch (error) {
        console.log(error)
    }


}


const cartQuantityUpdate = async (req, res) => {

    const {quantity, productId} = req.body
    if (quantity < 1) {
        return res.status(422).json({err: "Quantity should not be less than 1"})

    }

    
    const existProduct = await Products.findOne({_id: productId})

    const price = existProduct && Number(existProduct.price)
      
    let exist_Cart = await Cart.updateOne({
        userID: req.userID,
        "products.productId": productId
    }, {
        $set: {
            
            "products.$.quantity": quantity,
            "products.$.subTotal": Number(quantity*price),
        }
    })

    if (exist_Cart) {

        const addTotalPrice = await Cart.aggregate([
            {$match:{userID: req.userID.toString()}},
            {$addFields:{totalPrice:{$sum:"$products.subTotal"}}}
        ])

        let totalPrice= addTotalPrice.map(price => price.totalPrice)
        await Cart.updateOne({ userID: req.userID},{$set:{totalPrice:totalPrice[0]}})

    } else {
        res.status(500).json({err: 'Server Error'})

    }

    const updatedCart = await Cart.findOne({userID: req.userID})
    if(updatedCart){
        return  res.status(200).json({updateProducts: updatedCart.products,totalPrice:updatedCart.totalPrice})
    }

    
    

}

const getCartItems =  async (req, res) => {
    try {
        const cart = await Cart.findOne({userID: req.userID})
        if (cart) {
            const allProducts = cart.products.map(i => i)
            const cartQuan = cart.products.length
            return res.status(200).json({allProducts: allProducts, cartQuan: cartQuan})

        }else{
            return res.send(null)
        }
    } catch (error) {
        console.log(error)

    }
}

const  deleteCartItems = async (req, res) => {
    try {
        const productID = req.params.id.toString()
        let existCart = await Cart.findOne({userID: req.userID})
    
        if (existCart) {
            const productIndex = existCart.products.findIndex((p) => p.productId == productID)
            existCart.totalPrice = existCart.totalPrice - existCart.products[productIndex].subTotal

            if (productIndex > -1) {
            existCart.products.splice(productIndex, 1)

            }

            existCart = await existCart.save()
            res.status(200).json({success: true, existCart: existCart.products, totalPrice:existCart.totalPrice,message: "Item has been deleted."})

        
        }

    } catch (error) {
        console.log(error)

    }
}


module.exports = {addToCart,getCartItems,cartQuantityUpdate,deleteCartItems}