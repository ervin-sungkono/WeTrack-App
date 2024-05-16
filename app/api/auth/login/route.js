import { NextResponse } from "next/server"
import { auth, db } from "@/app/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    if(user.emailVerified != true){
      return NextResponse.json({
        message: "Verifikasi akun Anda terlebih dahulu!"
      }, { status: 401 })
    }

    if(user){
      const data = await getDoc(doc(db, 'users', user.uid))

      const { email, fullName, profileImage } = data.data()

      if(data.exists()){
        return NextResponse.json({
          data: {
            uid: data.id,
            email: email,
            fullName: fullName,
            profileImage: profileImage,
            isVerified: user.emailVerified,
          },
          message: 'Login berhasil'
        }, { status: 200 })
      }
      
      return NextResponse.json({
        message: "Akun tidak ditemukan"
      }, { status: 404 }) 
    }

    return NextResponse.json({
      message: 'Login gagal'
    }, { status: 500 })

  } catch (error) {
    console.error("Authentication error", error);

    return NextResponse.json({
      data: null,
      message: error.message
    }, { status: 500 })
  }
}
