"use client"
import RegisterForm from "../components/common/form/RegisterForm"
import { SessionProvider } from "next-auth/react"

export default function RegisterPage(){
    return(
        <SessionProvider>
            <RegisterForm />
        </SessionProvider>
    )
}