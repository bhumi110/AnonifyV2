const Post = require("../models/Post");
const ApiError = require("../utils/apiError");


exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("owner", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("owner", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });

    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
};


exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create({
      ...req.body,
      anonymous: Boolean(req.body.anonymous),
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return next(new ApiError(401, "Not authorized"));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};


exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return next(new ApiError(401, "Not authorized"));
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ---------------- REACT TO POST ----------------
exports.reactToPost = async (req, res) => {
  const { id, reaction } = req.params;
  const userId = req.user._id;

  const validReactions = ["fire", "drama", "skull", "shock"];
  if (!validReactions.includes(reaction)) {
    return res.status(400).json({ message: "Invalid reaction type" });
  }

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const alreadyReacted = post.reactions[reaction].some(
    (u) => u.toString() === userId.toString()
  );

  if (alreadyReacted) {
    post.reactions[reaction] = post.reactions[reaction].filter(
      (u) => u.toString() !== userId.toString()
    );
  } else {
    validReactions.forEach((type) => {
      post.reactions[type] = post.reactions[type].filter(
        (u) => u.toString() !== userId.toString()
      );
    });

    post.reactions[reaction].push(userId);
  }

  await post.save();

  res.status(200).json({
    success: true,
    reactions: {
      fire: post.reactions.fire.length,
      drama: post.reactions.drama.length,
      skull: post.reactions.skull.length,
      shock: post.reactions.shock.length,
    },
  });
};