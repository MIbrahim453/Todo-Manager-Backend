import joi from "joi"

const signUpSchema = joi.object({
    name: joi.string().trim().required(),
    email: joi.string().email().trim().required(),
    password: joi.string().min(6).trim().required(),
})