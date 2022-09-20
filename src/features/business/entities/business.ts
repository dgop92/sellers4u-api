import { SkipLimitPaginationSchema } from "@common/schemas/pagination";
import { AppUser } from "@features/auth/entities/app-user";
import Joi from "joi";

export interface Business {
  id: number;
  name: string;
  owner?: AppUser;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BusinessPaginationSchema = SkipLimitPaginationSchema.meta({
  className: "BusinessPagination",
});

export const BusinessOptionsSchema = Joi.object({
  fetchOwner: Joi.boolean().default(false),
}).meta({ className: "BusinessOptions" });

export const BusinessSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.number().optional(),
    name: Joi.string().optional(),
    appUserId: Joi.number().optional(),
  }).optional(),
  pagination: BusinessPaginationSchema,
  options: BusinessOptionsSchema,
}).meta({ className: "BusinessSearchInput" });

export const BusinessCreateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(5).max(100).required(),
  }).required(),
}).meta({ className: "BusinessCreateInput" });

export const BusinessUpdateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(5).max(100).optional(),
  }).required(),
}).meta({ className: "BusinessUpdateInput" });
