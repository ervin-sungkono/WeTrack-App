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