import Joi from "joi";

export const createUserSchema = Joi.object({
    emailAddress: Joi.string().email().max(100).required(),
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(8).max(20).required(),
});

// export const searchUserSchema = Joi.object({
//     emailAddress: Joi.string().email().optional(),
// });

// export const updateUserSchema = Joi.object({
//     email_address: Joi.string().email().max(100).required(),
//     username: Joi.string().min(3).max(50).required(),
// });

// export const editUserSchema = Joi.object({
//     email_address: Joi.string().email().max(255).optional(),
//     username: Joi.string().min(3).max(50).optional(),
// }).min(1);
