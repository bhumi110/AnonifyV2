const Joi = require("joi");

exports.createCommentSchema = Joi.object({
  comment: Joi.string().min(1).max(500).required(),
});