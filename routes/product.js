const express = require('express')
const { getSingleProduct, getNewproducts, getproductsByCategory } = require('../controllers/Product')

const router = express.Router()

router.get('/newarrivals', getNewproducts)
router.get('/product/:id', getSingleProduct )
router.get('/products/:name',getproductsByCategory )




module.exports = router
