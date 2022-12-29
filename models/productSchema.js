const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
       image_id:String,
       imgeUrl:String,
       imagePath:String
    },
    price: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    color: Array,
    size: Array,
    storage: Array,
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    stocks:{
        type:Number,
        default:0
    },
    sold:{
        type:Number,
        default:0
    }
   

}, {timestamps: true})




 const Products = mongoose.models.product ||mongoose.model("product", productSchema);


module.exports = Products;