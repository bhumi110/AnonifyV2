const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    reply: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    review: {
      hearts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      brokenhearts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);