import { NextResponse } from "next/server"
import { auth } from "@/app/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function POST (request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const user = userCredential.user;
   
    return NextResponse.json({
        status: 200,
        data: {
            uid: user.uid,
            email: user.email,
            fullName: user.displayName,
            accessToken: user.accessToken
        },
        message: "Successfully logged in"
    })

  } catch (error) {
    console.error("Authentication error", error);

    return NextResponse.json({
        status: 500,
        data: null,
        message: error.message
    })
  }
}
