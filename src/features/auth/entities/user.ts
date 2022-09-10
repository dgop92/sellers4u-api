import Joi from "joi";

export interface User {
  id: string;
  email: string;
}

export const UserSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().max(200).optional(),
    email: Joi.string().email().max(200).optional(),
  }).optional(),
}).meta({ className: "UserSearchInput" });

export const UserCreateInputSchema = Joi.object({
  data: Joi.object({
    email: Joi.string().email().max(200).required(),
    // Password must have at least 8 characters, an uppercase letter, a lowercase letter and a number
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&-]{8,100}$/)
      .required(),
  }).required(),
}).meta({ className: "UserCreateInput" });
