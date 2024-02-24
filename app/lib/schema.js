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