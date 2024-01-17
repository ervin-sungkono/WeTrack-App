# Contoh Login Form dengan formik

```
"use client"
import { Formik, Form } from "formik"
import { loginSchema } from "@/lib/schema"
import { signIn } from 'next-auth/react'
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import FormikField from "./formik/FormikField"
import Button from "../common/Button"

import { BiSolidUser as LoginIcon } from "react-icons/bi"


export default function LoginForm(){
    const [error, setError] = useState("")
    const initialValues = {
        username: "",
        password: ""
    }
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')
    const onSubmit = async(values) => {
        // Jalankan login handler disini
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
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={loginSchema}
        >
            {(formik) => {
                return(
                    <div className="w-full bg-white max-w-xl flex flex-col gap-6">
                        <Form className="w-full flex flex-col rounded-lg shadow-lg border border-dark/20 overflow-hidden">
                            <div className="flex flex-col gap-6 px-4 md:px-6 py-6 md:py-8">
                                <div className="flex flex-col items-center">
                                    <LoginIcon size={48} className="text-normal-green mb-4"/>
                                    <div className="font-bold text-dark text-2xl md:text-3xl mb-2">Login</div>
                                    <p className="text-dark/80 text-sm md:text-base">Pharma Metric Labs</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <FormikField label="Username" name="username" type="text" placeholder={"Enter username.."}/>
                                    <FormikField label="Password" name="password" type="password" placeholder={"Enter password.."}/>
                                </div>
                                <Button type={"submit"}>Login</Button>
                                {error && <p className="text-xs md:text-sm text-red-500">{error}</p>}
                            </div>
                            <div className="px-4 md:px-6 py-4 bg-gray-200 text-sm md:text-base">
                                New to site?{" "}
                                <span>
                                    <Link href={"/register"} className="underline text-normal-green">Create Account</Link>
                                </span>
                            </div>
                        </Form>
                        <p className="text-sm md:text-md text-dark/80 text-center">© 2023 All Rights Reserved, PT Pharma Metrics Labs</p>
                    </div>
                ) 
            }}
        </Formik>
    )
}
```