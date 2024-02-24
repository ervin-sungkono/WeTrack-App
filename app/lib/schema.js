// Semua Schema masuk di dalam file ini, nanti import schemanya di dalam component Form
import * as yup from 'yup'

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required("Email must be filled!")
        .email("Invalid email address!"),
    password: yup
        .string()
        .required("Password must be filled!")
})

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = yup.object().shape({
    fullName: yup
        .string()
        .required("Full name must be filled!")
        .min(3, "Full name must contain at least 3 characters!")
        .max(50, "Full name must contain at most 50 characters!"),
    email: yup
        .string()
        .required("Email must be filled!")
        .email("Invalid email address!"),
    password: yup
        .string()
        .required("Password must be filled!")
        .min(8, "Password must contain at least 8 characters!")
        .matches(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, and one number!"),
    confirmPassword: yup
        .string()
        .required("Password confirmation must be filled!")
        .oneOf([yup.ref('password')], 'Password and password confirmation must match!')  
})

export const projectTemplateSchema = yup.object().shape({
    templateType: yup
        .string()
        .required("Please choose one of the given template")
})

export const projectInformationSchema = yup.object().shape({
    projectName: yup
        .string()
        .required("Project name is required")
        .max(50),
    key: yup
        .string()
        .required("Key is required")
        .max(7)
})