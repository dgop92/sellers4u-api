import Joi from "joi";

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const CategorySearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.number().optional(),
    name: Joi.string().optional(),
  }).optional(),
}).meta({ className: "CategorySearchInput" });

export const CategoryCreateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional(),
  }).required(),
}).meta({ className: "CategoryCreateInput" });

export const CategoryUpdateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(1000).optional(),
  }).required(),
  searchBy: Joi.object({
    id: Joi.number().required(),
  }).required(),
}).meta({ className: "CategoryUpdateInput" });
