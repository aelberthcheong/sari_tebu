import Joi from "joi";

export const verifyPasswordSchema = Joi.object({
    password: Joi.string().min(8).max(20).required(),
});
