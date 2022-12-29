const express = require('express')
const router = express.Router()
const { cashOnDelivery, getKey, createRazorPay_order, verifyRazorPay_order, myOrder } = require('../controllers/Orders.js')
const { verifyToken, isUser } = require('../middleware/authenticate.js')


router.post('/cart/order',verifyToken,isUser,cashOnDelivery)
router.get('/cart/getKey',verifyToken,getKey)
router.post('/cart/createOrder',verifyToken,isUser, createRazorPay_order)
router.post('/cart/orderVerify',verifyToken, verifyRazorPay_order)
router.get('/myOrder',verifyToken,isUser,myOrder)

module.exports= router