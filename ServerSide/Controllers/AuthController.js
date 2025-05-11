// controllers/authController.js

const asyncHandler = require("express-async-handler");
const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const crypto       = require("crypto");
const { User, validateRegisterUser, validateLoginUser } = require("../Models/User");
const { VerificationToken } = require("../Models/VerificationToken");
const SendEmail    = require("../utils/SendEmail");

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Euclidean distance between two equal-length vectors
function euclideanDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

// Normalize a vector to unit length
function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (!norm) return vec;
  return vec.map(v => v / norm);
}

// Build the unified user response (with token, profile, follow, savedPosts, etc.)
function generateUserResponse(user) {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
  return {
    _id:          user._id,
    isAdmin:      user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username:     user.username,
    following:    user.following,
    followers:    user.followers,
    bio:          user.bio,
    savedPosts:   user.savedPosts
  };
}

// ─── Register ─────────────────────────────────────────────────────────────────

module.exports.RegisterUser = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (await User.findOne({ email: req.body.email })) {
    return res.status(400).json({ message: "User already exists!" });
  }

  const salt  = await bcrypt.genSalt(10);
  const hash  = await bcrypt.hash(req.body.password, salt);
  const user  = new User({
    username:       req.body.username,
    email:          req.body.email,
    password:       hash,
    faceEmbeddings: req.body.faceEmbeddings || []
  });
  await user.save();

  // create & email verification token
  const vtoken = new VerificationToken({
    userId: user._id,
    token:  crypto.randomBytes(32).toString("hex")
  });
  await vtoken.save();

  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${vtoken.token}`;
  await SendEmail(user.email, "Verify Your Email", `<p>Click to verify:</p><a href="${link}">${link}</a>`);

  res.status(201).json({ message: "Verification email sent" });
});

// ─── Traditional Login ────────────────────────────────────────────────────────

module.exports.loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid email or password" });

  if (!user.isAccountVerified) {
    // resend verification link
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

// ─── Face-ID Login ────────────────────────────────────────────────────────────

module.exports.FaceIdLogin = asyncHandler(async (req, res) => {
  const { embedding } = req.body;
  if (!Array.isArray(embedding)) {
    return res.status(400).json({ message: "Invalid face embedding" });
  }

  const received = normalize(embedding);

  // only consider verified accounts
  const users = await User.find({ isAccountVerified: true });
  const scored = users.map(u => {
    // stored faceEmbeddings might be a mixed type; ensure it's an array
    let stored = Array.isArray(u.faceEmbeddings) ? u.faceEmbeddings : [];
    const dist   = euclideanDistance(normalize(stored), received);
    return { user: u, dist };
  });

  // sort by distance
  scored.sort((a, b) => a.dist - b.dist);

  const THRESHOLD = 0.25; // max acceptable distance
  const MARGIN    = 0.05; // required gap to runner-up

  const best     = scored[0];
  const runnerUp = scored[1];

  // if nobody is close enough
  if (!best || best.dist > THRESHOLD) {
    return res.status(401).json({ message: "Face not recognized" });
  }

  // if unambiguous (only one below threshold or big gap to runner-up)
  if (!runnerUp || (runnerUp.dist - best.dist) > MARGIN) {
    return res.status(200).json(generateUserResponse(best.user));
  }

  // otherwise ambiguous → return list of all matching accounts
  const matches = scored
    .filter(s => s.dist <= THRESHOLD)
    .map(s => ({
      _id:          s.user._id,
      username:     s.user.username,
      profilePhoto: s.user.profilePhoto
    }));

  res.status(200).json({ multiple: true, accounts: matches });
});

// ─── Email Verification ───────────────────────────────────────────────────────

module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).json({ message: "Invalid link" });

  const vtoken = await VerificationToken.findOne({
    userId: user._id,
    token:  req.params.token
  });
  if (!vtoken) return res.status(400).json({ message: "Invalid link" });

  user.isAccountVerified = true;
  await user.save();
  await VerificationToken.deleteOne({ _id: vtoken._id });

  res.status(200).json({ message: "Account verified" });
});

// ─── Select from Multiple Face-ID Matches ───────────────────────────────────

module.exports.selectAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ message: "Account ID required" });

  const user = await User.findById(accountId);
  if (!user || !user.isAccountVerified) {
    return res.status(400).json({ message: "Invalid or unverified account" });
  }

  // now send exactly the same shape as traditional login
  res.status(200).json(generateUserResponse(user));
});
