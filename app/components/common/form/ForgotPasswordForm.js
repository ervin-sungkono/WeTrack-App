/* eslint-disable react/no-children-prop */

"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"
import { forgotPasswordSchema } from "@/app/lib/schema"

import Link from "next/link";
import WeTrackLogo from "../Logo";
import FormikField from "./formik/FormikField";
import FormikWrapper from "./formik/FormikWrapper";
import Button from "../button/Button";
import PopUpLoad from "../alert/PopUpLoad";
import { resetUserPassword } from "@/app/lib/fetch/user";
import PopUpInfo from "../alert/PopUpInfo";

export default function ForgotPasswordForm(){
    const initialValues = {
        email: "",
    }
    
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
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
            const res = await resetUserPassword({
                email: values.email
            })
            if (res.error) {
                setError(true);
                console.log(JSON.parse(res.error).errors)
            } else {
                setSuccess(true);
            }
        }catch(error){
            setError(true)
            setErrorMessage("Terjadi kesalahan, silakan coba lagi.")
        }finally{
            setLoading(false)
        }
    };
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-dark-blue py-8">
            <div className="flex flex-col justify-center items-center text-center w-5/6">
                <h1 className="text-2xl font-bold">
                    Lupa Kata Sandi?
                </h1>
                <p className="text-sm mt-1">
                    Masukkan email terdaftar untuk mengatur ulang kata sandi.
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-5/6 lg:w-2/5 rounded-xl max-w-lg lg:max-w-2xl">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={forgotPasswordSchema}
                    children={(formik) => (
                        <div>
                            <div className="mb-2">
                                <FormikField
                                    name="email"
                                    required
                                    type="email"
                                    label="Email"
                                    placeholder="Masukkan email..."
                                />
                            </div>
                            <p className="mb-2 text-[10.8px] md:text-xs text-dark-blue/80">Link pengaturan ulang kata sandi hanya akan terkirim apabila email yang Anda masukkan terdaftar di WeTrack.</p>
                            {error && <p className="text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
                            <div className="flex justify-center">
                                <Button variant="primary" type="submit" className="mt-2 w-full">
                                    Kirim
                                </Button>
                            </div>
                            <div className="mt-2 text-basic-blue text-center text-xs hover:underline">
                                <Link href="/login">
                                    Kembali ke halaman masuk
                                </Link>
                            </div>
                        </div>
                    )}
                />
            </div>
            <div className="flex flex-col justify-center items-center mt-6">
                <WeTrackLogo
                    // color="#1A1B36" 
                />
                <p className="text-sm mt-2">
                    &copy; 2024 All Rights Reserved
                </p>
            </div>
            {loading && <PopUpLoad />}
            {success &&
                <PopUpInfo
                    title={"Link Terkirim"}
                    titleSize={"default"}
                    message={"Silakan cek email Anda untuk memperoleh link pengaturan ulang kata sandi yang telah dikirimkan."}
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