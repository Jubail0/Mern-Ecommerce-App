const express = require('express')
const { addToCart, cartQuantityUpdate, deleteCartItems, getCartItems } = require('../controllers/Cart')
const { isUser,verifyToken } = require('../middleware/authenticate')
const router = express.Router()



router.post('/addToCart', verifyToken,addToCart)
router.post('/cart_product_quan', verifyToken,cartQuantityUpdate )
router.get('/cart', verifyToken,getCartItems)
router.delete('/cart/:id', verifyToken,isUser,deleteCartItems )


module.exports = router



