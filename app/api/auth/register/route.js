import { NextResponse } from "next/server";
import { auth, db } from "@/app/firebase/config";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth"
import { setDoc, collection, doc, serverTimestamp } from "firebase/firestore";

export async function POST(request) {
    try {
        const { fullName, email, password } = await request.json();

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        await sendEmailVerification(auth.currentUser)
            .then(() => {
                console.log("Email sent")
            }).catch((err) => {
                console.log("Error when sending email")
            })

        await updateProfile(auth.currentUser, { displayName: fullName })
        console.log("auth", auth.currentUser)

        const user = userCredential.user

        const userRef = doc(collection(db, "users"), user.uid);
   
        await setDoc(userRef, {
            fullName: fullName,
            email: email,
            description: null,
            jobPosition: null,
            profileImage: null,
            location: null,
            isVerified: false,
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