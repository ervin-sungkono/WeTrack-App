/* eslint-disable react/no-children-prop */
"use client"

import WeTrackLogo from "@/app/components/common/Logo"
import FormikWrapper from "@/app/components/common/form/formik/FormikWrapper"
import FormikField from "@/app/components/common/form/formik/FormikField"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import * as Yup from "yup"
import Link from "next/link"
import { FaGoogle } from "react-icons/fa";

export default function LoginForm(){
    const initialValues = {
        email: "",
        password: ""
    }

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email address").required("Required"),
        password: Yup.string().required("Required")
    })

    const [error, setError] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')

    const onSubmit = async(values) => {
        const res = await signIn("credentials", {
            ...values,
            redirect: false,
        })

        if (res.error) {
            setError(JSON.parse(res.error).errors)
        }else{
            router.push(callbackUrl ?? "/")
        }
    }

    return(
        <div className="flex min-h-screen flex-col items-center justify-center text-dark-blue">
            <div className="flex flex-col justify-center items-center ">
                <h1 className="text-3xl font-bold">
                    Sign In
                </h1>
                <p className="text-sm mt-2">
                    Welcome back, please sign in to continue.
                </p>
            </div>
            <div className="p-6 mt-4 bg-white shadow-lg" style={{ width: "40%" }}>
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                    children={(formik) => (
                        <div>
                            <div>
                                <FormikField
                                    name="email"
                                    required
                                    type="email"
                                    label="Email"
                                    placeholder="Enter email..."
                                />
                            </div>
                            <div className="mt-4">
                                <FormikField
                                    name="password"
                                    required
                                    type="password"
                                    label="Password"
                                    placeholder="Enter password..."
                                />
                            </div>
                            <div className="mt-2 text-basic-blue">
                                <Link href="#">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={formik.handleSubmit}
                                    className="w-full px-4 py-2 mt-4 rounded-md bg-basic-blue text-white font-semibold text-sm md:text-base"
                                >
                                    Sign In
                                </button>
                            </div>
                            {error && <p className="text-sm text-red">{error}</p>}
                            <div className="mt-2 text-basic-blue text-center">
                                <Link href="#">
                                    Create an account
                                </Link>
                            </div>
                            <div className="mt-4 flex justify-center items-center">
                                <hr style={{backgroundColor:'#1A1B36', height: '3px', width: '100%'}}/>
                                <span className="mx-3">
                                    OR
                                </span>
                                <hr style={{backgroundColor:'#1A1B36', height: '3px', width: '100%'}}/>
                            </div>
                            <div className="mt-4">
                                <Link href="#">
                                    <button
                                        className="w-full px-4 py-2 rounded-md border-2 border-basic-blue text-basic-blue font-semibold text-sm md:text-base flex justify-center items-center"
                                    >
                                        <FaGoogle className="inline-block mr-2" />
                                        Sign in with Google
                                    </button>
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
        </div>
    )
}