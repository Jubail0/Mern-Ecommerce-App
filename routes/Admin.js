const express = require("express")
const router = express.Router()
const upload = require('../utils/multer')

const {
    dashboardData,
    
    // Orders
    ordersData,
    singleOrderData,
    updateSingleOrder,
    delete_Single_orderInfo,
    // Products
    addproduct,
    getAllProducts,
    getSingleProduct,
    updateSingleProduct,
    deleteSingleProduct,
    // category
    createSubCategory,
    getSubCategories,
    deleteSubCategory

} = require('../controllers/Admin')
const { verifyToken, isAdmin } = require("../middleware/authenticate")
// const { isAdmin, verifyToken }= require('../middleware/authenticate')


// Dashboard
router.get('/admin/dasboards',dashboardData)
// Orders
router.get('/admin/orders',ordersData)
router.get('/admin/orders/:id',singleOrderData)
router.patch('/admin/orders/:id',verifyToken,isAdmin,updateSingleOrder)
router.delete('/admin/orders/:id',verifyToken,isAdmin,delete_Single_orderInfo)
// Products
router.post('/admin/addProduct',upload.single('productImage'),addproduct)
router.get('/admin/getSubCategories/:categories',getSubCategories)
router.get('/admin/products',getAllProducts)
router.get('/admin/products/:id',getSingleProduct)
router.patch('/admin/products/:id',upload.single('productImage'),updateSingleProduct)
router.delete('/admin/products/:id',deleteSingleProduct)
// Category
router.post('/admin/category/:id',verifyToken,isAdmin,createSubCategory)
router.delete('/admin/category/:id',verifyToken,isAdmin,deleteSubCategory)



module.exports = router


