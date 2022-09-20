import Joi from "joi";

export const IntegerLookUpInputSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.number().required(),
  }).required(),
}).unknown();
