/* eslint-disable react/no-children-prop */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import * as Yup from "yup"
import WeTrackLogo from "../Logo"
import FormikWrapper from "./formik/FormikWrapper"
import FormikField from "./formik/FormikField"
import Link from "next/link"
import Button from "../button/Button"
import { FaGoogle as Google } from "react-icons/fa"
import { POST } from "@/app/api/auth/register/route"

export default function RegisterForm(){
    const initialValues = {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    }
    
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Full name must be filled!"),
        email: Yup.string().email("Invalid email address!").required("Email must be filled!"),
        password: Yup.string().required("Password must be filled!"),
        confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Password and password confirmation must match!').required("Password confirmation must be filled!")
    })

    const [error, setError] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')

    const handleSubmit = async(values) => {
        const res = await POST(JSON.stringify(values))
        if (res.error) {
            setError(JSON.parse(res.error).errors)
        }else{
            router.push(callbackUrl ?? "/")
        }
    }

    return(
        <div className="flex min-h-screen flex-col items-center justify-center text-dark-blue py-8">
            <div className="flex flex-col justify-center items-center text-center w-5/6">
                <h1 className="text-2xl font-bold">
                    Sign Up
                </h1>
                <p className="text-sm mt-1">
                    Create an account to start tracking your project now!
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-5/6 lg:w-2/5 rounded-xl max-w-lg lg:max-w-2xl">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                    children={(formik) => (
                        <div>
                            <div>
                                <FormikField
                                    name="fullName"
                                    required
                                    type="text"
                                    label="Full Name"
                                    placeholder="Enter full name..."
                                />
                            </div>
                            <div className="mt-2">
                                <FormikField
                                    name="email"
                                    required
                                    type="email"
                                    label="Email"
                                    placeholder="Enter email..."
                                />
                            </div>
                            <div className="mt-2">
                                <FormikField
                                    name="password"
                                    required
                                    type="password"
                                    label="Password"
                                    placeholder="Enter password..."
                                />
                            </div>
                            <div className="mt-2">
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="Enter password confirmation..."
                                />
                            </div>
                            <div className="flex justify-center mt-4">
                                <Button variant="primary" size="sm" type="submit" className="w-full">
                                    Sign Up
                                </Button>
                            </div>
                            {error && <p className="text-sm text-red">{error}</p>}
                            <div className="mt-2 text-basic-blue text-center text-xs hover:underline">
                                <Link href="/login">
                                    Already have an account? Sign in
                                </Link>
                            </div>
                            <div className="mt-4 flex justify-center items-center">
                                <div className="w-full bg-dark-blue" style={{height: '1px'}}/>
                                <span className="mx-3">
                                    OR
                                </span>
                                <div className="w-full  bg-dark-blue" style={{height: '1px'}}/>
                            </div>
                            <div className="mt-4">
                                <Link href="#">
                                    <Button variant="secondary" size="sm" className="w-full mt-4 flex justify-center items-center">
                                        <Google className="inline-block mr-2" />
                                        Sign up with Google
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