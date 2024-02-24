import { NextResponse } from "next/server";
import { auth, db } from "@/app/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { setDoc, collection, doc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
    try {
        const { fullName, email, password } = await request.json();

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        await updateProfile(auth.currentUser, { displayName: fullName })

        const user = userCredential.user

        const userRef = doc(collection(db, "users"), user.uid);
   
        await setDoc(userRef, {
            fullName: fullName,
            email: email,
            description: null,
            jobPosition: null,
            profileImage: null,
            location: null,
            isVerified: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null

        }).then(() => {
            console.log("Successfully saved in database")

        }). catch((err) => {
            console.log("error", err)
        })

        return NextResponse.json({
            data: user,
            message: "Register Successful"
        }, { status: 200 })

    } catch (error) {
        console.error("Registration error", error)

        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 })

    }
}