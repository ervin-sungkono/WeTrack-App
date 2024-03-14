"use client"
import { SessionProvider } from "next-auth/react"
import ForgotPasswordForm from "../components/common/form/ForgotPasswordForm"

export default function ForgotPasswordPage(){
    return(
        <SessionProvider>
            <ForgotPasswordForm />
        </SessionProvider>
    )
}