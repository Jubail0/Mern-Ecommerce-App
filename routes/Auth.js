const express = require("express")
const router = express.Router()
const cookieParser = require('cookie-parser')
const {verifyToken, isUser} = require('../middleware/authenticate.js')
const {login, register, logout,update_Profile} = require("../controllers/Auth.js")
const upload = require("../utils/multer.js")
router.use(cookieParser())


router.post('/register', register)
router.post('/login', login)
router.get("/logout", verifyToken, logout)
router.patch('/update_profile/:id',verifyToken,upload.single('ProfileImage'),update_Profile)

module.exports = router
