const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getProfile, getUserProfile } = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.get("/:id", getUserProfile);

module.exports = router;