const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    totalPrice:{
        type:Number
    },
    products:[
        {
            productId:{
                type:String
            },
            productDetails:{
                type:Object
            },
            quantity:{
                type:Number,
                default:1
            },
            size:{
                type:String
            },
            storage:{
                type:String
            },
            subTotal:{
                type:Number,
                required:true
            }
        }
    ],
    
    totalPrice:Number

},{timestamps:true})

const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart