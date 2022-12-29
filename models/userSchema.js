
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    img:{
        image_id:{
            type:String,
            default:"blank_profile_image"
        },
        imageUrl:{
            type:String,
            default:"https://res.cloudinary.com/dynafik8q/image/upload/v1672160582/blank_profile_image.png"
        },
        imagePath:{
            type:String
        }
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    cart:Array
},{timestamps:true})

userSchema.methods.generateAuthToken = async function(){
    try {
        let token = jwt.sign({_id:this._id},process.env.SECRET_kEY)
        this.tokens = this.tokens.concat({token:token})
        await this.save()
        return token
    } catch (error) {
        console.log(error)
    }
}





const User = mongoose.model('User',userSchema)

 module.exports = User