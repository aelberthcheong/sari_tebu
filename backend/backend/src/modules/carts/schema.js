import Joi from "joi";

export const addItemSchema = Joi.object({
    product_id: Joi.string()
        .pattern(/^product-[A-Za-z0-9_-]{21}$/)
        .required(),
    quantity: Joi.number().positive().required(),
});

export const updateItemSchema = Joi.object({
    quantity: Joi.number().positive().required(),
});
