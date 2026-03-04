const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      enum: [
        "Relationship",
        "Family",
        "Advice",
        "Friendship",
        "Drama",
        "Hot Take",
      ],
      required: true,
    },

    story: {
      type: String,
      required: true,
      minlength: 10,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (val) {
          return val.length <= 5;
        },
        message: "Maximum 5 tags allowed",
      },
    },

    anonymous: {
      type: Boolean,
      default: false,
    },

    reactions: {
      fire: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      drama: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      skull: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      shock: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true },
);

postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Comment").deleteMany({
      _id: { $in: doc.comments },
    });
  }
});

module.exports = mongoose.model("Post", postSchema);
