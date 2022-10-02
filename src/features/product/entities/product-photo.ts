import Joi from "joi";

export interface ProductPhoto {
  imageId: string;
  url: string;
}

export const ProductPhotoCreateInputSchema = Joi.object({
  data: Joi.object({
    productId: Joi.number().required(),
    image: Joi.string().required(),
  }).required(),
}).meta({ className: "ProductPhotoCreateInput" });

export const ProductPhotoSearchInputSchema = Joi.object({
  searchBy: Joi.object({
    productId: Joi.number().optional(),
    imageId: Joi.string().optional(),
  }).optional(),
}).meta({ className: "ProductPhotoSearchInput" });
