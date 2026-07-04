import Joi from "joi";

// Batas ukuran wajar untuk data URL base64 (~2MB gambar mentah, data URL akan
// sedikit lebih besar karena encoding base64 menambah ~33% ukuran).
const imageUrlSchema = Joi.string()
    .max(3_000_000)
    .pattern(/^data:image\/(png|jpe?g|webp|gif);base64,/)
    .allow(null, "")
    .messages({
        "string.pattern.base": "Gambar harus berupa file PNG, JPG, WEBP, atau GIF.",
        "string.max": "Ukuran gambar terlalu besar. Maksimal sekitar 2MB.",
    });

export const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    image_url: imageUrlSchema.optional(),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().required().min(0),
    image_url: imageUrlSchema.optional(),
});

export const editProductSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().optional().min(0),
    image_url: imageUrlSchema.optional(),
}).min(1); // minimal satu field harus diisi

export const getProductsQuerySchema = Joi.object({
    name: Joi.string().optional(),
});

export const productIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^product-[A-Za-z0-9_-]{21}$/)
        .required(),
});
