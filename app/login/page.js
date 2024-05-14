"use client"
import { SessionProvider } from "next-auth/react"
import LoginForm from "../components/common/form/LoginForm"

export default function LoginPage(){
    return (
        <SessionProvider>
            <LoginForm />
        </SessionProvider> 
    )
}