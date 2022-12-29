const mongoose = require('mongoose')


const subCategories = new mongoose.Schema({
   
    mainCategory:{
        type:String
    },
    subCategory:{
        type:Array
    }
   
},{timestamps:true})

const subCat = mongoose.model('subCategories',subCategories)

module.exports = subCat