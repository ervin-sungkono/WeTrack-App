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
    fullName: yup
        .string()
        .required("Nama lengkap harus diisi!")
        .min(3, "Nama lengkap harus memiliki paling sedikit 3 karakter!")
        .max(50, "Nama lengkap harus memiliki paling banyak 50 karakter!"),
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

export const deleteProfileSchema = yup.object().shape({
    password: yup
        .string()
        .required("Kata sandi harus diisi!")
})

export const projectTemplateSchema = yup.object().shape({
    templateType: yup
        .string()
        .required("Pilih salah satu dari templat proyek yang diberikan!")
})

export const projectInformationSchema = yup.object().shape({
    projectName: yup
        .string()
        .required("Nama proyek harus diisi!")
        .matches(/^[a-zA-Z0-9\s]+$/, "Nama proyek tidak boleh mengandung karakter spesial!")
        .max(50, "Nama proyek harus memiliki paling banyak 50 karakter!"),
    key: yup
        .string()
        .required("Kunci proyek harus diisi!")
        .max(7, "Kunci proyek harus memiliki paling banyak 7 karakter!")
})

export const updateProjectSchema = yup.object().shape({
    projectName: yup
        .string()
        .required("Nama proyek harus diisi!")
        .matches(/^[a-zA-Z0-9\s]+$/, "Nama proyek tidak boleh mengandung karakter spesial!")
        .max(50, "Nama proyek harus memiliki paling banyak 50 karakter!"),
    key: yup
        .string()
        .required("Kunci proyek harus diisi!")
        .max(7, "Kunci proyek harus memiliki paling banyak 7 karakter!")
})

export const deleteProjectSchema = yup.object().shape({
    projectName: yup
        .string()
        .required("Nama proyek harus diisi!")
})

export const updateStatusSchema = yup.object().shape({
    statusName: yup
        .string()
        .required("Nama status tugas wajib diisi")
})

export const deleteStatusSchema = yup.object().shape({
    newStatusId: yup
        .string()
        .required("Wajib memilih status tugas baru")
})

export const newTaskSchema = yup.object().shape({
    type: yup.string()
        .default('Task')
        .required('Tipe harus diisi'),
    priority: yup.number()
        .default(0),
    startDate: yup.date()
        .nullable()
        .notRequired(),
    dueDate: yup.date()
        .nullable()
        .notRequired()
        .when('startDate', {
            is: (startDate) => !!startDate,
            then: (s) => s.min(yup.ref('startDate'),
                'Tenggat waktu harus sesudah tanggal mulai'
            ),
            otherwise: (s) => s
        }),
    taskName: yup.string()
        .required("Nama tugas wajib diisi"),
    description: yup.string()
        .nullable()
        .notRequired(),
    assignedTo: yup.string()
        .nullable()
        .notRequired(),
    parentId: yup.string()
        .nullable()
        .notRequired()
        .when('type', {
            is: 'SubTask',
            then: (s) => s.required('Wajib salah satu induk ketika memilih tipe subtugas'),
            otherwise: (s) => s,
        }),
})

export const updateTaskNameSchema = yup.object().shape({
    taskName: yup
        .string()
        .required("Nama tugas wajib diisi")
})