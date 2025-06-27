const jwt = require('jsonwebtoken');
const { User } = require('../Models/User');

const Protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, invalid token payload' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Protect middleware error:", error.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};

module.exports = { Protect };
