import Joi from "joi";

export interface User {
  id: number;
  username: string;
  email: string;
}

export const UserSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    username: Joi.string().max(80).optional(),
    email: Joi.string().max(200).optional(),
  }).optional(),
}).meta({ className: "UserSearchInput" });
