const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, validateRegisterUser, validateLoginUser } = require("../Models/User");
const { VerificationToken } = require("../Models/VerificationToken");
const SendEmail = require("../utils/SendEmail");

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  
  // Convert Float32Array to regular array if needed
  if (a instanceof Float32Array) a = Array.from(a);
  if (b instanceof Float32Array) b = Array.from(b);
  
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (normA * normB);
}

// Build the unified user response
function generateUserResponse(user) {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
  return {
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
    following: user.following,
    followers: user.followers,
    bio: user.bio,
    savedPosts: user.savedPosts,
    sharedPosts: user.sharedPosts,
    isAccountPrivate: user.isAccountPrivate,
  };
}

//Register

module.exports.RegisterUser = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (await User.findOne({ email: req.body.email })) {
    return res.status(400).json({ message: "User already exists!" });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    faceEmbeddings: req.body.faceEmbeddings || []
  });
  await user.save();

  const vtoken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex")
  });
  await vtoken.save();

  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${vtoken.token}`;
  await SendEmail(user.email, "Verify Your Email", `<p>Click to verify:</p><a href="${link}">${link}</a>`);

  res.status(201).json({ message: "Verification email sent" });
});

//Traditional Login

module.exports.loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid email or password" });

  if (!user.isAccountVerified) {
    let v = await VerificationToken.findOne({ userId: user._id });
    if (!v) {
      v = new VerificationToken({ userId: user._id, token: crypto.randomBytes(32).toString("hex") });
      await v.save();
    }
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${v.token}`;
    await SendEmail(user.email, "Verify Your Email", `<a href="${link}">${link}</a>`);
    return res.status(400).json({ message: "Please verify your email first" });
  }

  res.status(200).json(generateUserResponse(user));
});

//Face-ID Login
module.exports.FaceIdLogin = asyncHandler(async (req, res) => {
  const { embedding } = req.body;
  if (!Array.isArray(embedding) || embedding.length === 0) {
    return res.status(400).json({ message: "Invalid face embedding" });
  }

  const users = await User.find({ 
    isAccountVerified: true,
    faceEmbeddings: { $exists: true, $ne: [] } 
  });

  const THRESHOLD = 0.75;
  const matches = [];

  for (const user of users) {

    for (const storedEmbedding of user.faceEmbeddings) {
      if (storedEmbedding && storedEmbedding.length > 0) {
        const similarity = cosineSimilarity(embedding, storedEmbedding);
        if (similarity > THRESHOLD) {
          const existingMatch = matches.find(m => m.user._id.toString() === user._id.toString());
          if (!existingMatch || similarity > existingMatch.similarity) {
            matches.push({
              similarity,
              user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto
              }
            });
          }
        }
      }
    }
  }
  const uniqueMatches = [];
  matches.forEach(match => {
    const existing = uniqueMatches.find(m => m.user._id.toString() === match.user._id.toString());
    if (!existing || match.similarity > existing.similarity) {
      if (existing) {
        uniqueMatches.splice(uniqueMatches.indexOf(existing), 1);
      }
      uniqueMatches.push(match);
    }
  });
  uniqueMatches.sort((a, b) => b.similarity - a.similarity);

  if (uniqueMatches.length === 0) {
    return res.status(401).json({ message: "Face not recognized" });
  }

  if (uniqueMatches.length === 1) {
    return res.status(200).json(generateUserResponse(
      await User.findById(uniqueMatches[0].user._id)
    ));
  }

  res.status(200).json({
    multiple: true,
    accounts: uniqueMatches.map(match => match.user)
  });
});


//Verify User Account
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).json({ message: "Invalid link" });

  const vtoken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token
  });
  if (!vtoken) return res.status(400).json({ message: "Invalid link" });

  user.isAccountVerified = true;
  await user.save();
  await VerificationToken.deleteOne({ _id: vtoken._id });

  res.status(200).json({ message: "Account verified" });
});

//Select from Multiple Face-ID Matches

module.exports.selectAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ message: "Account ID required" });

  const user = await User.findById(accountId);
  if (!user || !user.isAccountVerified) {
    return res.status(400).json({ message: "Invalid or unverified account" });
  }

  res.status(200).json(generateUserResponse(user));
});