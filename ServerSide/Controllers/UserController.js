const asyncHandler = require("express-async-handler");
const { User } = require("../Models/User");


module.exports.updateBio = asyncHandler(async (req, res) => {
    const { bio } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
        user.bio = bio;
        await user.save();
        res.status(200).json(bio);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

module.exports.getUserbyId = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
}
);