const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  checkEmail,
  checkUsername,
} = require("../controllers/authController");

const validate = require("../middleware/validateMiddleware");
const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidator");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

router.get("/check-email", checkEmail);
router.get("/check-username", checkUsername);

module.exports = router;