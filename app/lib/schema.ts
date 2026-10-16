import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().required("Email harus diisi!").email("Email tidak valid!"),
  password: yup.string().required("Kata sandi harus diisi!"),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().required("Email harus diisi!").email("Email tidak valid!"),
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = yup.object({
  fullName: yup.string()
    .required("Nama lengkap harus diisi!")
    .min(3, "Nama lengkap harus memiliki paling sedikit 3 karakter!")
    .max(50, "Nama lengkap harus memiliki paling banyak 50 karakter!"),
  email: yup.string().required("Email harus diisi!").email("Email tidak valid!"),
  password: yup.string()
    .required("Kata sandi harus diisi!")
    .min(8, "Kata sandi harus memiliki paling sedikit 8 karakter!")
    .matches(passwordRegex, "Kata sandi harus memiliki paling sedikit 1 huruf besar, 1 huruf kecil, dan 1 angka!"),
  confirmPassword: yup.string()
    .required("Konfirmasi kata sandi harus diisi!")
    .oneOf([yup.ref("password")], "Kata sandi dan konfirmasi kata sandi harus sama!"),
});

export const changePasswordSchema = yup.object({
  oldPassword: yup.string().required("Kata sandi lama harus diisi!"),
  newPassword: yup.string()
    .required("Kata sandi baru harus diisi!")
    .min(8, "Kata sandi baru harus memiliki paling sedikit 8 karakter!")
    .matches(passwordRegex, "Kata sandi baru harus memiliki paling sedikit 1 huruf besar, 1 huruf kecil, dan 1 angka!"),
  confirmPassword: yup.string()
    .required("Konfirmasi kata sandi baru harus diisi!")
    .oneOf([yup.ref("newPassword")], "Kata sandi baru dan konfirmasi kata sandi baru harus sama!"),
});

export const updateProfileSchema = yup.object({
  fullName: yup.string()
    .required("Nama lengkap harus diisi!")
    .min(3, "Nama lengkap harus memiliki paling sedikit 3 karakter!")
    .max(50, "Nama lengkap harus memiliki paling banyak 50 karakter!"),
  description: yup.string().max(256, "Deskripsi harus memiliki paling banyak 256 karakter!"),
  jobPosition: yup.string().max(50, "Posisi pekerjaan harus memiliki paling banyak 50 karakter!"),
  location: yup.string().max(50, "Lokasi harus memiliki paling banyak 50 karakter!"),
});

export const deleteProfileSchema = yup.object({
  confirmationPassword: yup.string().required("Kata sandi harus diisi!"),
});

export const projectTemplateSchema = yup.object({
  templateType: yup.string().required("Templat proyek harus dipilih!"),
});

export const projectInformationSchema = yup.object({
  projectName: yup.string()
    .required("Nama proyek harus diisi!")
    .matches(/^[a-zA-Z0-9\s]+$/, "Nama proyek tidak boleh mengandung karakter spesial!")
    .max(50, "Nama proyek harus memiliki paling banyak 50 karakter!"),
  key: yup.string().required("Kunci proyek harus diisi!").max(7, "Kunci proyek harus memiliki paling banyak 7 karakter!"),
});

export const updateProjectSchema = yup.object({
  projectName: yup.string()
    .required("Nama proyek harus diisi!")
    .matches(/^[a-zA-Z0-9\s]+$/, "Nama proyek tidak boleh mengandung karakter spesial!")
    .max(50, "Nama proyek harus memiliki paling banyak 50 karakter!"),
  key: yup.string().required("Kunci proyek harus diisi!").max(7, "Kunci proyek harus memiliki paling banyak 7 karakter!"),
});

export const deleteProjectSchema = yup.object({
  projectName: yup.string().required("Nama proyek harus diisi!"),
});

export const updateStatusSchema = yup.object({
  statusName: yup.string().required("Nama status tugas harus diisi!").max(20, "Nama status harus memiliki paling banyak 20 karakter!"),
});

export const deleteStatusSchema = yup.object({
  newStatusId: yup.string().required("Status tugas baru harus dipilih!"),
});

export const newTaskSchema = yup.object({
  projectId: yup.string().required("Anda harus memiliki setidaknya satu proyek untuk membuat tugas baru!"),
  type: yup.string().default("Task").required("Tipe harus diisi!"),
  priority: yup.number().default(0),
  startDate: yup.date().nullable().notRequired(),
  dueDate: yup.date().nullable().notRequired().when("startDate", {
    is: (startDate: Date | null | undefined) => Boolean(startDate),
    then: (schema) => schema.min(yup.ref("startDate"), "Tenggat waktu harus dipilih setelah tanggal mulai!"),
  }),
  taskName: yup.string().required("Nama tugas harus diisi!").max(50, "Nama tugas harus memiliki paling banyak 50 karakter!"),
  description: yup.string().nullable().notRequired().max(1000, "Deskripsi melebihi batas karakter"),
  assignedTo: yup.string().nullable().notRequired(),
  parentId: yup.string().nullable().notRequired().when("type", {
    is: "SubTask",
    then: (schema) => schema.required("Induk tugas harus dipilih untuk tipe subtugas!"),
  }),
});

export const updateTaskNameSchema = yup.object({
  taskName: yup.string().required("Nama tugas harus diisi!").max(50, "Nama tugas harus memiliki paling banyak 50 karakter!"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;
export type DeleteAccountFormValues = yup.InferType<typeof deleteProfileSchema>;
export type UpdateProfileFormValues = yup.InferType<typeof updateProfileSchema>;
export type UpdateProjectFormValues = yup.InferType<typeof updateProjectSchema>;
export type DeleteProjectFormValues = yup.InferType<typeof deleteProjectSchema>;
export type NewTaskFormValues = yup.InferType<typeof newTaskSchema>;
export type UpdateTaskNameFormValues = yup.InferType<typeof updateTaskNameSchema>;
export type UpdateStatusFormValues = yup.InferType<typeof updateStatusSchema>;
