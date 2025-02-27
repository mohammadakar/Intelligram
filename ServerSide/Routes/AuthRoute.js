const { RegisterUser, loginUser, FaceIdLogin, verifyUserAccountCtrl, selectAccount } = require("../Controllers/AuthController");
const loginLimiter = require("../Middlewares/LoginLimiter");

const router=require("express").Router();

router.post('/register',RegisterUser);
router.post('/login',loginLimiter,loginUser);
router.post('/faceLogin',FaceIdLogin);
router.post('/selectAccount', selectAccount);
router.get("/:userId/verify/:token",verifyUserAccountCtrl);

module.exports=router;