const { updateBio } = require('../Controllers/UserController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();


router.post("/update-bio",Protect,updateBio);







module.exports = router;