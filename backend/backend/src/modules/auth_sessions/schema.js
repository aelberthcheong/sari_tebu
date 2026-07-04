import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(10).max(100).required(),
    role: Joi.string().valid("OWNER", "ADMIN", "KASIR").default("KASIR"),
});
 
export const loginSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
    password: Joi.string().min(10).max(100).required(),
});