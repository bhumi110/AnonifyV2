const Joi = require("joi");

// ---------------- REGISTER VALIDATION ----------------
exports.registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.alphanum": "Username must contain only letters and numbers",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must not exceed 30 characters",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{6,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter and one number",
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),
});


// ---------------- LOGIN VALIDATION ----------------
exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});