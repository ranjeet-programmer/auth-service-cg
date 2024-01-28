import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required",
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: "firstName is required",
        notEmpty: true,
    },
    lastName: {
        errorMessage: "lastName is required",
        notEmpty: true,
    },
    password: {
        errorMessage: "password is required",
        notEmpty: true,
        isLength: {
            options: {
                min: 8,
                max: 20,
            },
            errorMessage: "Password must be between 8 and 20 characters",
        },
    },
});
