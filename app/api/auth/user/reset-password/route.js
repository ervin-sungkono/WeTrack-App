import { auth } from "@/app/firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"
import { NextResponse } from "next/server"

export async function POST(request, response) {
    try {
        const { email } = await request.json()
        console.log(auth)
        sendPasswordResetEmail(auth, email)
            
        return NextResponse.json({
            success: true,
            message: "Successfully sent password reset email"
        })

    } catch (error) {
        return NextResponse.json({
            message: error.message
        }, { status: 500 })
    }
}