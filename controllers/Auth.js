const User = require('../models/userSchema.js')
const bcrypt = require('bcryptjs')
const cloudinary = require('../utils/cloudinary')
const { exists } = require('../models/userSchema.js')

 const register =async(req,res)=>{
    const{name,email,password,cpassword}=req.body
    if(!name || !email || !password ||!cpassword){
        return res.status(422).json({err:"Please enter the full details"})
    }
   
    try {
        const checkEmail = await User.findOne({email:email})
        if(checkEmail){
            return res.status(422).json({err:"Email already exists."})
        }else{

            if(password !== cpassword){
                return res.status(422).json({err:"Passwords do not matched"})
            }
                const securePassword = bcrypt.hashSync(password,bcrypt.genSaltSync())
                const securePassword2 = bcrypt.hashSync(cpassword,bcrypt.genSaltSync())

                const detailsSaved = new User({email:email,name:name,password:securePassword,cpassword:securePassword2})
                const registered = await detailsSaved.save()
            
           
           

            if(registered){
                return res.status(200).json({message:"Register Successfull!"})
            }else{
                return res.status(500).json({err:"Server Error"})
            }
        }

    } catch (error) {
        console.log(error)
    }
 }

 const login = async(req,res)=>{
    const{email,password}=req.body

    try {

        if(!email || !password){
             return res.status(422).json({err:"Please enter the full details"})
        }

        const userExists = await User.findOne({email:email})

        if(userExists){
            const comparePassword =  bcrypt.compareSync(password,userExists.password)
           
            let token  = await userExists.generateAuthToken()

            res.cookie('myShop',token,{
                expires:new Date(Date.now() +258920000),
                httpOnly:true,
                sameSite: 'None', 
                secure: true
            })

            if(!comparePassword){
                return res.status(422).json({err:"password do not match"})
            }else{
                const userDetails ={
                    _id:userExists._id,
                    name:userExists.name,
                    email:userExists.email,
                    role:userExists.role,
                    img:userExists.img,
                    created :userExists.createdAt
                }
                return res.status(200).json({user:userDetails, message:"Login Successfull"})
            }

        }else{
            res.status(500).json({err:"No user found, Please register!"})
        }
    } catch (error) {
        console.log(error)
    }
 }

// For Logout

 const logout = (req,res)=>{
    try {
      req.user.tokens = req.user.tokens.filter(t => {return t.token !== req.token})
      res.clearCookie('myShop',{path:'/'})
      res.status(200).send("Logout Successfull")
      req.user.save()

    } catch (error) {
        console.log(error)
    }
    
    


}


const update_Profile = async(req,res)=>{
try {
    const img = req.file?.path
    const {name,email}=req.body
    const ID = req.params?.id
    
    

    if(!name || !email ){
        return res.status(422).json({err:'Invalid Details'})
    }
   

  
   let updates ={}
   if(img){

  
          const imageDetails = await cloudinary.uploader.upload

        (
            img,{folder:'userProfile'
           
        })
           
               updates.name = name;
               updates.email = email;
               updates.img = {
                           image_id: imageDetails.public_id,
                           imageUrl: imageDetails.secure_url,
                           imagePath: img
                         }
            
       
                        }


      const updateDetails = await User.findByIdAndUpdate({_id:ID},
              {
                  $set: updates
              
              })
      

 
    
    if(!updateDetails){
        return res.status(422).json({err:'Failed To ADD Profile Image'})

    }


        const getUpdatedUser = await User.findOne({email:email})

        if(getUpdatedUser){
            const updatedDetails ={
                _id:getUpdatedUser._id,
                name:getUpdatedUser.name,
                email:getUpdatedUser.email,
                role:getUpdatedUser.role,
                img:getUpdatedUser.img,
                created :getUpdatedUser.createdAt
            }
            return res.status(200).json({message:"Updated Successfully" , user:updatedDetails})
        }

    

  
} catch (error) {
    console.log(error)
}

}

module.exports ={login,register,logout,update_Profile}
