const { updateBio, getUserbyId } = require('../Controllers/UserController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();


router.post("/update-bio",Protect,updateBio);
router.get("/getUserbyId/:id",getUserbyId);






module.exports = router;