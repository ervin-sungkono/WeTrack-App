import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const loggedIn = session.user
        const userId = session.user.uid

        if(!loggedIn){
            return NextResponse.json({
                message: "Unauthorized, must login first"
            }, { status: 401 })
        }

        if(!userId){
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 })
        }

        const data = await getDoc(doc(db, 'users', userId))

        if(!data){
            return NextResponse.json({
                message: "Can't find user detail"
            }, { status: 404 })
        }

        const { fullName, email, jobPosition , location, profileImage } = data.data()

        return NextResponse.json({
            data: {
                uid: data.id,
                email: email,
                fullName: fullName,
                jobPotition: jobPosition ?? null,
                location: location ?? null,
                profileImage: profileImage,
            }, 
            message: "Successfully get user detail"
        }, { status: 200 })

    } catch (error) {
        console.error("Can't create task", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}