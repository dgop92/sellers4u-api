import Joi from "joi";

export interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const AppUserSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.number().optional(),
    userId: Joi.string().min(1).max(128).optional(),
  }).optional(),
}).meta({ className: "AppUserSearchInput" });

export const AppUserCreateInputSchema = Joi.object({
  data: Joi.object({
    firstName: Joi.string().max(120).required(),
    lastName: Joi.string().max(120).required(),
    userId: Joi.string().min(1).max(128).required(),
  }).required(),
}).meta({ className: "AppUserCreateInput" });

export const AppUserUpdateInputSchema = Joi.object({
  data: Joi.object({
    firstName: Joi.string().max(120).optional(),
    lastName: Joi.string().max(120).optional(),
  }).required(),
  searchBy: Joi.object({
    id: Joi.number().required(),
  }).required(),
}).meta({ className: "AppUserUpdateInput" });
