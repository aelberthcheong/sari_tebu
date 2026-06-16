import Joi from "joi";

export const createAuthSchema = Joi.object({
    emailAddress: Joi.string().required(),
    password: Joi.string().required(),
});

export const renewAccessTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

export const logoutAuthSchema = Joi.object({
    refreshToken: Joi.string().required(),
});
