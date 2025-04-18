const { z } = require('zod')

const signUpSchema = z.object({
    username: z
    .string({ required_error: "PLease Fill this field" })
    .trim()
    .min(3, { message: "Username Must be contain char more 3!!" })
    .max(15, { message: "Username must be contain less than 15 char" }),

    email: z
    .string({ required_error: "PLease Fill this field" })
    .trim()
    .email({message: "Invalid Email Address"})
    .min(3, { message: "Email Must be contain char more 3!!" })
    .max(26, { message: "Email must be contain less than 15 char" }),

    password: z
    .string({ required_error: "PLease Fill this field" })
    .min(3, { message: "Password Must be contain char more 3!!" })
    .max(15, { message: "Password must be contain less than 15 char" }),

    phone: z
    .string({ required_error: "PLease Fill this field" })
    .trim()
    .min(10, { message: "Phone No Must be contain more than 10 number" })
    .max(15, { message: "Phone No Must be contain more than 15 number" })
});

module.exports = signUpSchema;