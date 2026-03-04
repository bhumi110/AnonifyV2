const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createComment,
  deleteComment,
  createReply,
  reviewComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createCommentSchema } = require("../validators/commentValidator");

router.post("/:postId", protect, validate(createCommentSchema), createComment);

router.delete("/:commentId", protect, deleteComment);

router.post("/:commentId/reply", protect, createReply);

router.post("/:commentId/review/:type", protect, reviewComment);

module.exports = router;