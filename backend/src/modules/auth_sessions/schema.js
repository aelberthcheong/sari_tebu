import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(8).max(100).required(),
});
 
export const loginSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
    password: Joi.string().min(10).max(100).required(),
});