const mongoose=require("mongoose");
const joi=require("joi");
const passwordComplexity=require("joi-password-complexity");

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    profilePhoto: {
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            publicId:null,
        }
    },
    faceEmbeddings: { 
        type: Array 
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    }
},{timestamps:true});

//generate Auth token
userSchema.methods.generteAuthToken=function(){
    return jwt.sign({id:this._id,isAdmin:this.isAdmin},process.env.JWT_SECRET);
}

//User model
const User=mongoose.model("user",userSchema);

//validate register user
function validateRegisterUser(obj){
    const schema=joi.object({
        username:joi.string().trim().min(2).max(150).required(),
        email:joi.string().trim().min(7).max(120).required().email(),
        password:passwordComplexity().required(),
        faceEmbeddings:joi.array()
    });
    return schema.validate(obj);
}

//validate login 
function validateLoginUser(obj){
    const schema=joi.object({
        email:joi.string().trim().min(7).max(120).required().email(),
        password:joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

//Validate email
function validateEmail(obj){
    const schema=joi.object({
        email:joi.string().trim().min(5).max(100).required().email(),
    });
    return schema.validate(obj);
}

//Validate newPass
function validateNewPassword(obj){
    const schema=joi.object({
        password:passwordComplexity().required(),
    });
    return schema.validate(obj);
}

module.exports={
    User,
    validateLoginUser,
    validateRegisterUser,
    validateEmail,
    validateNewPassword
}