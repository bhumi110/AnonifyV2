const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ---------------- REGISTER ----------------
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, "Email already registered");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(400, "Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

// ---------------- LOGIN ----------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

// ---------------- LOGOUT ----------------
// JWT logout is handled on frontend (delete token)
exports.logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ---------------- CHECK EMAIL ----------------
exports.checkEmail = async (req, res) => {
  const user = await User.findOne({ email: req.query.email });
  res.json({ exists: !!user });
};

// ---------------- CHECK USERNAME ----------------
exports.checkUsername = async (req, res) => {
  const user = await User.findOne({ username: req.query.username });
  res.json({ exists: !!user });
};