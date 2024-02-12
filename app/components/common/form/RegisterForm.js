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

export default function RegisterForm(){
    const initialValues = {
        fullName: "",
        email: "",
        password: ""
    }
    
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Required"),
        email: Yup.string().email("Invalid email address").required("Required"),
        password: Yup.string().required("Required")
    })

    const [error, setError] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

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
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold">
                    Sign Up
                </h1>
                <p className="text-sm mt-1">
                    Create an account to start tracking your project now!
                </p>
            </div>
            <div className="p-4 md:p-6 mt-4 bg-white shadow-lg w-4/5 md:w-3/5 lg:w-2/5">
                <FormikWrapper
                    initialValues={initialValues}
                    onSubmit={onSubmit}
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
                            <div className="mt-3">
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
                            <div className="mt-3">
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="Enter password confirmation..."
                                />
                            </div>
                            <div className="flex justify-center mt-4">
                                <Button variant="primary" size="sm" onClick={formik.handleSubmit} className="w-full">
                                    Sign Up
                                </Button>
                            </div>
                            {error && <p className="text-sm text-red">{error}</p>}
                            <div className="mt-2 text-basic-blue text-center text-xs">
                                <Link href="/login">
                                    Already have an account? Sign in
                                </Link>
                            </div>
                            <div className="mt-4 flex justify-center items-center">
                                <div className="w-full bg-dark-blue" style={{height: '2px'}}/>
                                <span className="mx-3">
                                    OR
                                </span>
                                <div className="w-full  bg-dark-blue" style={{height: '2px'}}/>
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