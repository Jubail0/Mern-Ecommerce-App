const jwt = require('jsonwebtoken')
const User = require('../models/userSchema.js')


const verifyToken = async(req,res,next)=>{
try {
    
    const token = req.cookies.myShop
    const verify = jwt.verify(token,process.env.SECRET_kEY);

    const rootUser = await User.findOne({_id:verify._id,'tokens.token':token})
    if(!rootUser){throw new Error('User not found')}

    req.token= token
    req.user= rootUser
    req.userID = rootUser._id
    
    next()
} catch (error) {
   return res.status(442).json({err:"Unauthorized: Token not provided"})
}
}

const isUser = (req,res,next)=>{
if(req.user.role === "user"){
    next()
}else{
    return res.status(422).json({err:'Access Denied'})
}
}

const isAdmin = (req,res,next)=>{
if(req.user.role === "admin"){
    next()
}else{
    return res.status(422).json({err:'Access Denied'})
}
}



module.exports = {verifyToken,isAdmin,isUser}