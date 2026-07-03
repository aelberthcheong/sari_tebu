import Joi from "joi";

export const verifyCurrentPasswordSchema = Joi.object({
    currentPassword: Joi.string().max(100).required(),
});

export const updatePasswordSchema = Joi.object({
    newPassword: Joi.string().min(10).max(100).required(),
});