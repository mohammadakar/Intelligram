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
        // Use Mixed so legacy string values are allowed
        type: mongoose.Schema.Types.Mixed,
        default: [],
        get: function(value) {
            // If value is already an array of numbers, return it
            if (Array.isArray(value) && typeof value[0] === "number") {
                return value;
            }
            // If it's a string, try to fix it:
            if (typeof value === "string") {
                try {
                    // Replace single quotes with double quotes for valid JSON
                    let fixed = value.replace(/'/g, '"');
                    let parsed = JSON.parse(fixed);
                    // If parsed is an array with one element that is an object, convert it:
                    if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === "object") {
                        let newArr = [];
                        // Assuming keys "0" to "127"
                        for (let i = 0; i < 128; i++) {
                            newArr.push(Number(parsed[0][i]));
                        }
                        return newArr;
                    }
                    // Otherwise, if parsed is an array of numbers, return it
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                } catch (e) {
                    console.error("Error parsing legacy embedding:", e);
                    return [];
                }
            }
            return [];
        }
    },
    following: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    followers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    bio:{
        type:String,
        default:"",
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

// Enable getters when converting to JSON or Object:
userSchema.set("toJSON", { getters: true });
userSchema.set("toObject", { getters: true });

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