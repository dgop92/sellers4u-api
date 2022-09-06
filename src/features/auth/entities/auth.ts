import Joi from "joi";

export const LoginInputSchema = Joi.object({
  data: Joi.object({
    email: Joi.string().max(200).required(),
    // Password must have at least 8 characters, an uppercase letter, a lowercase letter and a number
    password: Joi.string()
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*d)[A-Za-zd$@$!%*?&]{8,100}$")
      )
      .required(),
  }).required(),
}).meta({ className: "LoginInput" });
