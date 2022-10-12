import { SkipLimitPaginationSchema } from "@common/schemas/pagination";
import { Business } from "@features/business/entities/business";
import Joi from "joi";
import { Category } from "./category";
import { ProductPhoto } from "./product-photo";

export interface Product {
  id: number;
  name: string;
  description: string;
  code: string;
  price: number;
  category?: Category;
  business?: Business;
  photos?: ProductPhoto[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const ProductPaginationSchema = SkipLimitPaginationSchema.meta({
  className: "ProductPagination",
});

export const ProductOptionsSchema = Joi.object({
  fetchCategory: Joi.boolean().default(false),
  fetchBusiness: Joi.boolean().default(false),
  fetchPhotos: Joi.boolean().default(false),
}).meta({ className: "ProductOptions" });

export const ProductSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.number().optional(),
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    businessId: Joi.number().optional(),
    categoryId: Joi.number().optional(),
  }).optional(),
  filterBy: Joi.object({
    price: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional(),
    })
      .or("min", "max")
      .optional(),
  }).optional(),
  options: ProductOptionsSchema,
  pagination: ProductPaginationSchema,
}).meta({ className: "ProductSearchInput" });

export const ProductCreateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(2).max(130).required(),
    code: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().required(),
    categoryId: Joi.number().required(),
    businessId: Joi.number().required(),
  }).required(),
}).meta({ className: "ProductCreateInput" });

export const ProductUpdateInputSchema = Joi.object({
  data: Joi.object({
    name: Joi.string().min(2).max(130).optional(),
    code: Joi.string().min(1).max(50).optional(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().optional(),
    categoryId: Joi.number().optional(),
  }).required(),
  searchBy: Joi.object({
    id: Joi.number().required(),
  }).required(),
}).meta({ className: "ProductUpdateInput" });
