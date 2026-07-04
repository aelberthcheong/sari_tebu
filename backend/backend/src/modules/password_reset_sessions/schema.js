import Joi from "joi";

export const createPasswordResetSessionSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
});

export const verifyEmailAddressSchema = Joi.object({
    code: Joi.string().length(8).pattern(/^\d+$/).required(),
});

export const resetPasswordSchema = Joi.object({
    password: Joi.string().min(10).max(100).required(),
});