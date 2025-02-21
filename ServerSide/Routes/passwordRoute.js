const router = require("express").Router();
const { sendResetPasswordLink, getResetPasswordCtrl, resetPasswordCtrl } = require("../Controllers/passwordController");



router.post("/reset-password-link" ,sendResetPasswordLink)
router.route("/reset-password/:userId/:token").get(getResetPasswordCtrl)
.post(resetPasswordCtrl)



module.exports=router;