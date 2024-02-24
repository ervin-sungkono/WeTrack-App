// Semua Schema masuk di dalam file ini, nanti import schemanya di dalam component Form
import * as yup from 'yup'

export const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email address!").required("Email must be filled!"),
    password: yup.string().required("Password must be filled!")
})

export const registerSchema = yup.object().shape({
    fullName: yup.string().required("Full name must be filled!"),
    email: yup.string().email("Invalid email address!").required("Email must be filled!"),
    password: yup.string().required("Password must be filled!"),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Password and password confirmation must match!').required("Password confirmation must be filled!")
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