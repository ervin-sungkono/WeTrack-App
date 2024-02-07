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
import Button from "../button/Button"

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
                <h1 className="text-2xl font-bold">
                    Sign In
                </h1>
                <p className="text-sm mt-1">
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
                            <div className="mt-3">
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
                                <Button variant="primary" size="sm" onClick={formik.handleSubmit} className="w-full mt-4">
                                    Sign In
                                </Button>
                            </div>
                            {error && <p className="text-sm text-red">{error}</p>}
                            <div className="mt-2 text-basic-blue text-center text-xs">
                                <Link href="/register">
                                    Create an account
                                </Link>
                            </div>
                            <div className="mt-4 flex justify-center items-center">
                                <hr style={{backgroundColor:'#1A1B36', height: '2px', width: '100%'}}/>
                                <span className="mx-3">
                                    OR
                                </span>
                                <hr style={{backgroundColor:'#1A1B36', height: '2px', width: '100%'}}/>
                            </div>
                            <div className="mt-4">
                                <Link href="#">
                                    <Button variant="secondary" size="sm" className="w-full mt-4 flex justify-center items-center">
                                        <FaGoogle className="inline-block mr-2" />
                                        Sign in with Google
                                    </Button>
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