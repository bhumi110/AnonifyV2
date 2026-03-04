const Joi = require("joi");

exports.createPostSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),

  category: Joi.string()
    .valid("Relationship", "Family", "Advice", "Friendship", "Drama", "Hot Take")
    .required(),

  story: Joi.string().min(10).required(),

  tags: Joi.array()
    .items(Joi.string().trim())
    .max(5)
    .optional(),

  anonymous: Joi.boolean().optional(),
});