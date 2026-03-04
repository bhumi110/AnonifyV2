const User = require("../models/User");
const Post = require("../models/Post");

// GET /api/users/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userPosts = await Post.find({ owner: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    user,
    posts: userPosts,
  });
};

// GET /api/users/:id
const getUserProfile = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userPosts = await Post.find({ owner: id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    user,
    posts: userPosts,
  });
};

module.exports = {
  getProfile,
  getUserProfile,
};