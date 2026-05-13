import Joi from "joi";

export const checkoutSchema = Joi.object({
    cash: Joi.number().integer().min(1).required(),
});
