/* eslint-disable react/no-children-prop */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { registerSchema } from "@/app/lib/schema"
import { useSession } from "next-auth/react"
import { signUp } from "@/app/lib/fetch/user"
import { FaGoogle as Google } from "react-icons/fa"
import { sanitizeName } from "@/app/lib/string"

import WeTrackLogo from "../Logo"
import FormikWrapper from "./formik/FormikWrapper"
import FormikField from "./formik/FormikField"
import Link from "next/link"
import Button from "../button/Button"
import PopUpLoad from "../alert/PopUpLoad"

export default function RegisterForm(){
    const initialValues = {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    }

    const [error, setError] = useState("")
    const [errorMessage, setErrorMessage] = useState("Something went wrong, please try again later.")
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
                // router.replace(callbackUrl ?? "/dashboard");
                router.push("/login")
            }
        } catch (error) {
            setError(true);
            if(error.message.includes("auth/email-already-in-use")){
                setErrorMessage("Email already in use!")
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
                    validationSchema={registerSchema}
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
                            <div className="mt-2 mb-4">
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="Enter password confirmation..."
                                />
                            </div>
                            {error && <p className="mb-2 text-md text-center text-danger-red font-bold">{errorMessage}</p>}
                            <div className="flex justify-center">
                                <Button variant="primary" size="sm" type="submit" className="w-full">
                                    Sign Up
                                </Button>
                            </div>
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
                                    <Button variant="primary" outline size="sm" className="w-full mt-4 flex justify-center items-center">
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
            {loading && <PopUpLoad />}
        </div>
    )
}