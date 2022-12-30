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



// Dashboard
router.get('/admin/dasboards',verifyToken,isAdmin,verifydashboardData)
// Orders
router.get('/admin/orders',verifyToken,isAdmin,ordersData)
router.get('/admin/orders/:id',verifyToken,isAdmin,singleOrderData)
router.patch('/admin/orders/:id',verifyToken,isAdmin,updateSingleOrder)
router.delete('/admin/orders/:id',verifyToken,isAdmin,delete_Single_orderInfo)
// Products
router.post('/admin/addProduct',verifyToken,isAdmin,upload.single('productImage'),addproduct)
router.get('/admin/getSubCategories/:categories',verifyToken,isAdmin,getSubCategories)
router.get('/admin/products',verifyToken,isAdmin,getAllProducts)
router.get('/admin/products/:id',verifyToken,isAdmin,getSingleProduct)
router.patch('/admin/products/:id',verifyToken,isAdmin,upload.single('productImage'),updateSingleProduct)
router.delete('/admin/products/:id',verifyToken,isAdmin,deleteSingleProduct)
// Category
router.post('/admin/category/:id',verifyToken,isAdmin,createSubCategory)
router.delete('/admin/category/:id',verifyToken,isAdmin,deleteSubCategory)



module.exports = router


