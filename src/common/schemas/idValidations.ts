import Joi from "joi";

export const IntegerLookUpInputSchema = Joi.object({
  id: Joi.number().required(),
}).unknown();
