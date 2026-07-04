import Joi from "joi";

export const createSignupSessionSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
});

export const verifyEmailAddressSchema = Joi.object({
    code: Joi.string().length(8).pattern(/^\d+$/).required(),
});
