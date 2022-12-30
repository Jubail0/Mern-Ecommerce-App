const subCat = require('../models/categorySchema.js');
const  Products = require('../models/productSchema.js')
const Orders = require('../models/orderSchema')

const getproductsByCategory = async (req, res) => {
    
    const mainCategory = req.params.name.toString()
    const page = req.query.page || 1;   
    const priceSort = req.query.pricesort;
    const limit = 5
    
//    Price Ascending & Descending
    let sortPrice= {}

    if(priceSort === "highest"){
    sortPrice.price = parseInt(-1)

    }else{
    sortPrice.price = parseInt(1)

    }

    let match ={}

    if(mainCategory){
        match.category = mainCategory
    }
    if(req.query.subcat){
        match.subCategory = req.query.subcat.toLowerCase().split(',')
    }
 
    if(req.query.pricerange){
        const priceRange = req.query.pricerange.split(',')

        if(priceRange[1]>0){
            match.price = {$gte: Number(priceRange[0]),$lte: Number(priceRange[1])}

        }
        
    }
    if(req.query.search){
        match.name = new RegExp(req.query.search,"i")
    }
 

  const productPerPage = await Products.find(match).sort(sortPrice).limit(limit * 1).skip((page - 1) * limit)


//   Numbers of products
  const totalproductsPerPage = await Products.find(match).count()
  const allProducts = await Products.find({})
  const categoryLength = allProducts?.filter(i => i.category === mainCategory).length
  const totalProducts = allProducts?.length
  const totalPages = Math.ceil(totalproductsPerPage/limit)

   // Max Price and Min Price for Price Range value
  let sortedPrice = await Products.find({category: mainCategory}).sort({price: 1})
  sortedPrice = sortedPrice.map(i => i.price)

//   Get sub Categories
  const getSubCat = await subCat.find({mainCategory:mainCategory})

    if(!getSubCat){
        return res.status(422).json({err:"No sub-categories are found"})
    }

  res.status(200).json({
    "productPerPage":productPerPage,
    "totalProductsPerPage":totalproductsPerPage,
    "totalProducts":totalProducts,
    "totalPages":totalPages,
    "categoryLength":categoryLength,
    "sortedPrice":sortedPrice,
    "getSubCat":getSubCat
})
}

const getSingleProduct = async (req, res) => {
    const {id} = req.params
    try {
        const singleProduct = await Products.findOne({_id: id})

        if (! singleProduct) {
            return res.status(500).json({err: "No Product found!"})
            
        } else {
            return res.status(200).json(singleProduct)
        }

    } catch (error) {
        console.log(error)
    }
}

const getNewproducts = async (req, res) => {
    try {
        const newArrivals = await Products.find().sort({createdAt: -1}).limit(4)

        const topProducts = await Products.find().sort({sold:-1}).limit(8)

        if (!newArrivals || !topProducts ) {
            return res.status(500).json({err: "No Product found!"})

        } else {
            return res.status(200).json({newArrivalProducts:newArrivals,top:topProducts})

        }
    } catch (error) {
        console.log(error)
    }
}




module.exports = {getNewproducts,getproductsByCategory,getSingleProduct}
