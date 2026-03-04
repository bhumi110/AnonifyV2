const express = require("express");
const router = express.Router();

const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  reactToPost
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createPostSchema } = require("../validators/postValidator");


router.post("/:id/react/:reaction", protect, reactToPost);


router.route("/")
  .get(getPosts)
  .post(
    protect,
    validate(createPostSchema),
    createPost
  );

router.route("/:id")
  .get(getPostById)
  .put(
    protect,
    validate(createPostSchema),
    updatePost
  )
  .delete(protect, deletePost);

module.exports = router;