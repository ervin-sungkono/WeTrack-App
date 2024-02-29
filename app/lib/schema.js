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

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup
        .string()
        .required("Old password must be filled!"),
    newPassword: yup
        .string()
        .required("New password must be filled!")
        .min(8, "New password must contain at least 8 characters!")
        .matches(passwordRegex, "New password must contain at least one uppercase letter, one lowercase letter, and one number!"),
    confirmPassword: yup
        .string()
        .required("New password confirmation must be filled!")
        .oneOf([yup.ref('newPassword')], 'New password and password confirmation must match!')
})

export const updateProfileSchema = yup.object().shape({
    description: yup
        .string()
        .required("Description must be filled!")
        .max(256, "Description must contain at most 256 characters!"),
    jobPosition: yup
        .string()
        .required("Job position must be filled!")
        .max(50, "Job position must contain at most 50 characters!"),
    location: yup
        .string()
        .required("Location must be filled!")
        .max(50, "Location must contain at most 50 characters!")
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