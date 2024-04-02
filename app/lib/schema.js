// Semua Schema masuk di dalam file ini, nanti import schemanya di dalam component Form
import * as yup from 'yup'

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required("Email harus diisi!")
        .email("Email tidak valid!"),
    password: yup
        .string()
        .required("Kata sandi harus diisi!")
})

export const forgotPasswordSchema = yup.object().shape({
    email: yup
        .string()
        .required("Email harus diisi!")
        .email("Email tidak valid!"),
})

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = yup.object().shape({
    fullName: yup
        .string()
        .required("Nama lengkap harus diisi!")
        .min(3, "Nama lengkap harus memiliki paling sedikit 3 karakter!")
        .max(50, "Nama lengkap harus memiliki paling banyak 50 karakter!"),
    email: yup
        .string()
        .required("Email harus diisi!")
        .email("Email tidak valid!"),
    password: yup
        .string()
        .required("Kata sandi harus diisi!")
        .min(8, "Kata sandi harus memiliki paling sedikit 8 karakter!")
        .matches(passwordRegex, "Kata sandi harus memiliki paling sedikit 1 huruf besar, 1 huruf kecil, dan 1 angka!"),
    confirmPassword: yup
        .string()
        .required("Konfirmasi kata sandi harus diisi!")
        .oneOf([yup.ref('password')], 'Kata sandi dan konfirmasi kata sandi harus sama!')  
})

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup
        .string()
        .required("Kata sandi lama harus diisi!"),
    newPassword: yup
        .string()
        .required("Kata sandi baru harus diisi!")
        .min(8, "Kata sandi baru harus memiliki paling sedikit 8 karakter!")
        .matches(passwordRegex, "Kata sandi baru harus memiliki paling sedikit 1 huruf besar, 1 huruf kecil, dan 1 angka!"),
    confirmPassword: yup
        .string()
        .required("Konfirmasi kata sandi baru harus diisi!")
        .oneOf([yup.ref('newPassword')], 'Kata sandi baru dan konfirmasi kata sandi baru harus sama!')
})

export const updateProfileSchema = yup.object().shape({
    description: yup
        .string()
        .max(256, "Deskripsi harus memiliki paling banyak 256 karakter!"),
    jobPosition: yup
        .string()
        .max(50, "Posisi pekerjaan harus memiliki paling banyak 50 karakter!"),
    location: yup
        .string()
        .max(50, "Lokasi harus memiliki paling banyak 50 karakter!")
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
        .matches(/^[a-zA-Z0-9\s]+$/, "Project name cannot contain special character")
        .max(50),
    key: yup
        .string()
        .required("Key is required")
        .max(7)
})