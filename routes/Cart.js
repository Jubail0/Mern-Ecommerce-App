const express = require('express')
const { addToCart, cartQuantityUpdate, deleteCartItems, getCartItems } = require('../controllers/Cart')
const { isUser,verifyToken } = require('../middleware/authenticate')
const router = express.Router()



router.post('/addToCart', verifyToken,isUser,addToCart)
router.post('/cart_product_quan', verifyToken,isUser,cartQuantityUpdate )
router.get('/cart', verifyToken,isUser,getCartItems)
router.delete('/cart/:id', verifyToken,isUser,deleteCartItems )


module.exports = router



