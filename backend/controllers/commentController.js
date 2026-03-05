const Post = require("../models/Post");
const Comment = require("../models/Comment");
const ApiError = require("../utils/apiError");

// ---------------- CREATE COMMENT ----------------

exports.createComment = async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  const comment = await Comment.create({
    comment: req.body.comment,   
    author: req.user._id,        
    post: post._id,              
  });

  post.comments.push(comment._id);
  await post.save();

  res.status(201).json({
    success: true,
    comment,
  });
};

// ---------------- DELETE COMMENT ----------------
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden");
  }

  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id }
  });

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
};


exports.reviewComment = async (req, res) => {
  const { commentId, type } = req.params;
  const userId = req.user._id;

  const validTypes = ["hearts", "brokenhearts"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid review type" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  comment.review.hearts = comment.review.hearts.filter(
    (u) => u.toString() !== userId.toString()
  );

  comment.review.brokenhearts = comment.review.brokenhearts.filter(
    (u) => u.toString() !== userId.toString()
  );

  const alreadyReviewed = comment.review[type].some(
    (u) => u.toString() === userId.toString()
  );

  if (!alreadyReviewed) {
    comment.review[type].push(userId);
  }

  await comment.save();

  res.json({
    success: true,
    review: comment.review,
  });
};




exports.createReply = async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const reply = {
    reply: req.body.reply,
    author: req.user._id,
  };

  comment.replies.push(reply);
  await comment.save();

  res.status(201).json({
    success: true,
    message: "Reply added",
    replies: comment.replies,
  });
};