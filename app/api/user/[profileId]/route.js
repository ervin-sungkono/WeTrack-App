import { db } from '@/app/firebase/config';
import { nextAuthOptions } from '@/app/lib/auth';
import { getUserSession } from "@/app/lib/session";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response){
    try{
        const session = await getUserSession(request, response, nextAuthOptions);
        const userId = session.user.uid;
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 });
        }

        const { profileId } = response.params;

        const profileRef = doc(db, 'users', profileId);

        if(!profileRef){
            return NextResponse.json({
                message: "Profile not found"
            }, { status: 404 });
        }

        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.data();

        if(!profileData){
            return NextResponse.json({
                message: "Profile detail not found"
            }, { status: 404 });
        }

        if(profileData.deletedAt != null) {
            return NextResponse.json({
                message: "User not found"
            }, {status:  404 })
        }

        return NextResponse.json({
            data: {
                id: profileSnap.id,
                ...profileData
            },
            message: "Successfully retrieved user profile"
        }, { status: 200 });

    }catch(error){
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}