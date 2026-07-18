import Joi from "joi";

export const addNewUserSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(10).max(100).required(),
});

export const editUserSchema = Joi.object({
    id: Joi.string()
        .pattern(/^user-[A-Za-z0-9_-]{21}$/)
        .required(),
});

export const getUserByIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^user-[A-Za-z0-9_-]{21}$/)
        .required(),
});

export const getUserByEmailAddressSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
});

export const getUserByUsernameSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
});
