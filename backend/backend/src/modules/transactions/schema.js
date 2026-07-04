import Joi from "joi";

export const checkoutSchema = Joi.object({
    cartId: Joi.string()
        .pattern(/^cart-[A-Za-z0-9_-]{21}$/)
        .required(),
});