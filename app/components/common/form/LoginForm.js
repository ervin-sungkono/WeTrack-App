/* eslint-disable react/no-children-prop */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { signIn } from "@/app/lib/fetch/user"
import { loginSchema } from "@/app/lib/schema"

import Link from "next/link"
import WeTrackLogo from "@/app/components/common/Logo"
import FormikWrapper from "@/app/components/common/form/formik/FormikWrapper"
import FormikField from "@/app/components/common/form/formik/FormikField"
import Button from "../button/Button"
import PopUpLoad from "../alert/PopUpLoad"

export default function LoginForm(){
    const initialValues = {
        email: "",
        password: ""
    }
    
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
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
        setError(false);
        setLoading(true);
        try {
            const res = await signIn({
                ...values
            })
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
            } else {
                // router.replace(callbackUrl ?? "/dashboard");
                router.push("/dashboard")
            }
        } catch (error) {
            setError(true);
            let errorMessage = JSON.parse(error.message).message;
            if(errorMessage === "Firebase: Error (auth/invalid-credential)."){
                errorMessage = "Kredensial yang Anda masukkan salah!"
            }
            setErrorMessage(errorMessage);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex min-h-screen flex-col items-center justify-center text-dark-blue py-8">
            <div className="flex flex-col justify-center items-center text-center w-5/6">
                <h1 className="text-2xl font-bold">
                    Masuk
                </h1>
                <p className="text-sm mt-1">
                    Selamat datang, silakan masuk untuk melanjutkan.
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-5/6 lg:w-2/5 rounded-xl max-w-lg lg:max-w-2xl">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={loginSchema}
                    children={(formik) => (
                        <div>
                            <div>
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
                            <div className="mt-2 mb-4 text-basic-blue text-xs hover:underline">
                                <Link href="/forgotPassword">
                                    Lupa kata sandi?
                                </Link>
                            </div>
                            {error && <p className="mb-2 text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
                            <div className="flex justify-center">
                                <Button variant="primary" type="submit" className="w-full">
                                    Masuk
                                </Button>
                            </div>
                            <div className="mt-2 text-basic-blue text-center text-xs hover:underline">
                                <Link href="/register">
                                    Buat akun
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
        </div>
    )
}