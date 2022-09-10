import Joi from "joi";

export const LoginInputSchema = Joi.object({
  data: Joi.object({
    email: Joi.string().max(200).required(),
    // Password must have at least 8 characters, an uppercase letter, a lowercase letter and a number
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&-]{8,100}$/)
      .required(),
  }).required(),
}).meta({ className: "LoginInput" });
