import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email Field is Required",
        notEmpty: true,
        trim: true,
    },
});
