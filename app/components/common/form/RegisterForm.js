/* eslint-disable react/no-children-prop */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
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

export default function RegisterForm(){
    const initialValues = {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    }

    const [error, setError] = useState("")
    const [errorMessage, setErrorMessage] = useState("Ada kesalahan, silakan coba lagi nanti.")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')
    const { status } = useSession()

    useEffect(() => {
        if(status === 'authenticated'){
            router.replace('/dashboard')
        }
    })

    const handleSubmit = async (values) => {
        let fullName = sanitizeName(values.fullName)
        let email = values.email.toLowerCase()

        setError(false);
        setLoading(true);
        try {
            const res = await signUp({
                ...values,
                fullName: fullName,
                email: email,
                redirect: false
            });
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
            } else {
                setSuccess(true);
            }
        } catch (error) {
            setError(true);
            if(error.message.includes("auth/email-already-in-use")){
                setErrorMessage("Email sudah digunakan!")
            }
            console.log(error.message)
        } finally {
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
                    Buat akun untuk mulai melacak proyek Anda sekarang!
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-5/6 lg:w-2/5 rounded-xl max-w-lg lg:max-w-2xl">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={registerSchema}
                    children={(formik) => (
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
                            {error && <p className="mb-2 text-md text-center text-danger-red font-bold">{errorMessage}</p>}
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
                />
            </div>
            <div className="flex flex-col justify-center items-center mt-6">
                <a href="/" className="hover:brightness-75">
                    <WeTrackLogo />
                </a>
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