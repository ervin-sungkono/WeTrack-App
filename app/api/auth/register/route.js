import { NextResponse } from "next/server";
import { auth } from "@/app/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

export async function POST (request) {
    try {
        const { fullName, email, password } = await request.json();
       
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        await updateProfile(auth.currentUser, { displayName: fullName })

        const user = userCredential.user

        return NextResponse.json({ 
            statusCode: 200, 
            data: user, 
            message: "Register Successful" 
        })
        
    } catch (error) {
        console.error("Registration error", error)

        return NextResponse.json({ 
            statusCode: 500, 
            data: null,
            message: error.message 
        })
    
    }
}