const asyncHandler=require("express-async-handler");
const bcrypt=require("bcryptjs");
const {User,validateEmail,validateNewPassword}=require("../Models/User");
const {VerificationToken} =require("../Models/VerificationToken");
const crypto=require("crypto")
const SendEmail=require("../utils/SendEmail")


//Send the reset pass link
module.exports.sendResetPasswordLink=asyncHandler(async (req,res)=>{
    //validation
    const {error} =validateEmail(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    
    //get the user from DB by email
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return res.status(404).json({message:"User with given email does not exist"})
    }

    //creating verification
    let verificationToken= await VerificationToken.findOne({userId:user._id})
    if(!verificationToken){
        verificationToken=new VerificationToken({
            userId:user._id,
            token:crypto.randomBytes(32).toString("hex")
        });
        await verificationToken.save();
    }

    //creating link
    const link=`${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`

    //creating html template
    const htmlTemplate=`
        <a href="${link}">Click here to reset your password</a>
    `
    //sending email
    await SendEmail(user.email,"Reset password",htmlTemplate);

    //res to client
    res.status(200).json({message:"Password reset link sent to your Email"})
})

//get the reset password ctrl 
module.exports.getResetPasswordCtrl=asyncHandler(async (req,res)=>{
    const user=await User.findById(req.params.userId)
    if(!user){
        return res.status(400).json({message:"invalid link"})
    }

    const verificationToken= await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token,
    })
    if(!verificationToken){
        return res.status(400).json({message:"invalid link"})
    }

    res.status(200).json({message:"Valid URL"})

})

//reset the password
module.exports.resetPasswordCtrl=asyncHandler(async (req,res)=>{
    const {error} =validateNewPassword(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    const user=await User.findById(req.params.userId);
    if(!user){
        return res.status(400).json({message:"Invalid link"})
    }

    const verificationToken =await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token,
    })
    if(!verificationToken){
        return res.status(400).json({message:"Invalid link"})
    }

    if(!user.isAccountVerified){
        user.isAccountVerified=true
    }

    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);

    user.password=hashedPassword;
    await user.save();
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res.status(200).json({message:"Password reset successfully , Please login"})
})