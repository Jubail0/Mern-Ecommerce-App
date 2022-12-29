const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
    },
    orderItems:{
        type:Object
    },
    orderStatus:{
        type:String,
        default:"processing",
        enum:["processing","shipped","delivered"],
    },
    totalPrice:{
        type:Number,
        required:true,
        default:0.0
    },
    userAddress:{
        type:Object
    },
    paymentMethod:{
        type:String,
        enum:["Cash on delivery", "Razorpay"],
        required:true,
        
    },
    isPaid:{
        type:Boolean,
        default:false,
        required:true
    },
    razorpay:{
        type:Object
    },
    codId:{
        type:Object
    },

    paidAt:{
        type:Date
    },
    deliveredAt:{
        type:Date
    },
  


},{timestamps:true})





const Order = mongoose.model("Order",orderSchema)

module.exports = Order