import Joi from "joi";

export const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().required().min(0),
});

export const editProductSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().optional().min(0),
}).min(1); // minimal satu field harus diisi

export const getProductsQuerySchema = Joi.object({
    name: Joi.string().optional(),
});

export const productIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^product-[A-Za-z0-9_-]{21}$/)
        .required(),
});
