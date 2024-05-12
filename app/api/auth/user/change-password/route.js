import { auth } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { NextResponse } from "next/server";

export async function POST(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({
                message: "Unauthorized, must login first"
            }, { status: 401 });
        }

        const email = session.user.email;
        const { oldPassword, newPassword } = await request.json()

        if(!oldPassword || !newPassword){
            return NextResponse.json({
                message: "Missing payload"
            })
        }

        const credential = await signInWithEmailAndPassword(auth, email, oldPassword)  
        if(!credential) {
            return NextResponse.json({
                message: "Password lama tidak sesuai"
            }, { status: 400 })
        }      

        await updatePassword(auth.currentUser, newPassword) 

        return NextResponse.json({
            success: true,
            message: "Successfully change the password"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: error.message
        }, { status: 500 })
    }
}