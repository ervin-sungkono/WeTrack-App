// Semua Schema masuk di dalam file ini, nanti import schemanya di dalam component Form
import * as yup from 'yup'

export const loginSchema = yup.object().shape({
    username: yup
        .string()
        .required("Username is required"),
    password: yup
        .string()
        .required("Password is required")
})