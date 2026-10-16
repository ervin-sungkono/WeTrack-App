"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { FormikHelpers } from "formik"
import { registerSchema } from "@/app/lib/schema"
import { useSession } from "next-auth/react"
import { signUp } from "@/app/lib/fetch/user"
import { sanitizeName } from "@/app/lib/string"

import WeTrackLogo from "../Logo"
import FormikWrapper from "./formik/FormikWrapper"
import FormikField from "./formik/FormikField"
import Link from "next/link"
import Button from "../button/Button"
import PopUpLoad from "../alert/PopUpLoad"
import PopUpInfo from "../alert/PopUpInfo"
import type { RegisterFormValues } from "@/app/lib/schema"

export default function RegisterForm(){
    const initialValues = {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    }

    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const { status } = useSession()

    useEffect(() => {
        if(status === 'authenticated'){
            router.replace('/dashboard')
        }
    }, [router, status])

    const handleSubmit = async (values: RegisterFormValues, { setFieldError }: FormikHelpers<RegisterFormValues>) => {
        const fullName = sanitizeName(values.fullName)
        const email = values.email.toLowerCase()

        setLoading(true);
        try {
            const res = await signUp({
                password: values.password,
                fullName: fullName,
                email: email,
            });
            if(res.success){
                setSuccess(true);
            } else {
                setErrorMessage(res.message ?? "Pendaftaran gagal. Silakan coba lagi.")
            }
        }catch(error) {
            if(error instanceof Error && error.message.includes("auth/email-already-in-use")){
                setFieldError("email", "Email sudah digunakan!")
            } else {
                setErrorMessage(error instanceof Error ? error.message : "Pendaftaran gagal. Silakan coba lagi.")
            }
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className="flex min-h-screen flex-col items-center justify-center text-dark-blue py-8">
            <div className="flex flex-col justify-center items-center text-center w-5/6">
                <h1 className="text-2xl font-bold">
                    Daftar
                </h1>
                <p className="text-sm mt-1">
                    Buat akun untuk mulai melakukan manajemen tugas Anda sekarang!
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-5/6 lg:w-2/5 rounded-xl max-w-lg lg:max-w-2xl">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={registerSchema}
                >
                    {() => (
                        <div>
                            <div>
                                <FormikField
                                    name="fullName"
                                    required
                                    type="text"
                                    label="Nama Lengkap"
                                    placeholder="Masukkan nama lengkap..."
                                />
                            </div>
                            <div className="mt-2">
                                <FormikField
                                    name="email"
                                    required
                                    type="email"
                                    label="Email"
                                    placeholder="Masukkan email..."
                                />
                            </div>
                            <div className="mt-2">
                                <FormikField
                                    name="password"
                                    required
                                    type="password"
                                    label="Kata Sandi"
                                    placeholder="Masukkan kata sandi..."
                                />
                            </div>
                            <div className="mt-2 mb-4">
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Konfirmasi Kata Sandi"
                                    placeholder="Masukkan konfirmasi kata sandi..."
                                />
                            </div>
                            {errorMessage && <p role="alert" className="mb-2 text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
                            <div className="flex justify-center">
                                <Button variant="primary" type="submit" className="w-full">
                                    Daftar
                                </Button>
                            </div>
                            <div className="mt-2 text-basic-blue text-center text-xs hover:underline">
                                <Link href="/login">
                                    Sudah punya akun? Masuk
                                </Link>
                            </div>
                        </div>
                    )}
                </FormikWrapper>
            </div>
            <div className="flex flex-col justify-center items-center mt-6">
                <Link href="/" className="hover:brightness-75">
                    <WeTrackLogo />
                </Link>
                <p className="text-sm mt-2">
                    &copy; 2024 All Rights Reserved
                </p>
            </div>
            {loading && <PopUpLoad />}
            {success &&
                <PopUpInfo
                    title={"Pendaftaran Berhasil"}
                    titleSize={"default"}
                    message={"Silakan cek email Anda untuk verifikasi email terlebih dahulu."}
                >
                    <div className="flex justify-end gap-2 md:gap-4">
                        <Button onClick={() => {
                            setSuccess(false)
                            router.push("/login")
                        }} className="w-24 md:w-32">OK</Button>
                    </div>
                </PopUpInfo>
            }
        </div>
    )
}
