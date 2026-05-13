import Joi from "joi";

export const addCartSchema = Joi.object({
    product_id: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required(),
});
