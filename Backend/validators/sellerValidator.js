import Joi from "joi";

export const sellerSignupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().length(10).required(),
  password: Joi.string().min(6).required(),
});
