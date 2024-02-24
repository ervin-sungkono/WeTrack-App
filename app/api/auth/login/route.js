import { NextResponse } from "next/server"
import { auth } from "@/app/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    return NextResponse.json({
      data: {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName,
        accessToken: user.accessToken,
        profileImage: user.photoURL
      },
      message: "Successfully logged in"
    }, { status: 200 })

  } catch (error) {
    console.error("Authentication error", error);

    return NextResponse.json({
      data: null,
      message: error.message
    }, { status: 500 })
  }
}
