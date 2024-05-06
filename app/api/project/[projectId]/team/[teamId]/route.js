import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PUT(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { teamId } = response.params
        const { role } = await request.json()

        if(!teamId){
            return NextResponse.json({
                message: "Please check your parameter"
            }, { status: 404 })
        }

        if(!role){
            return NextResponse.json({
                message: "Please check your payload"
            }, { status: 404 })
        }

        const teamDocRef = doc(db, "teams", teamId)
        const teamDoc = await getDoc(teamDocRef)
        const teamData = teamDoc.data()

        await updateDoc(doc(db, "teams", teamId), {
            role: role ?? teamData.role
        })
        
        return NextResponse.json({
            message: "Successfully update the role"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { teamId } = response.params

        if(!teamId){
            return NextResponse.json({
                message: "Please check your parameter"
            }, { status: 404 })
        }

        await deleteDoc(doc(db, "teams", teamId))

        return NextResponse.json({
            message: "Successfully remove the user from the team"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}