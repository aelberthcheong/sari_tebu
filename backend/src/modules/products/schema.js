import Joi from "joi";

export const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),
});
