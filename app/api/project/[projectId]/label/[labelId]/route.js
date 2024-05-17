import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getProjectRole } from "@/app/firebase/util";
import { NextResponse } from "next/server";

export async function PUT(request, response){
    try {       
        const session = await getUserSession(request, response, nextAuthOptions);
        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" ,
                success: false
            }, { status: 404 });
        }

        const { content, backgroundColor } = await request.json()
        const { labelId } = response.params
        
        if(!backgroundColor){
            return NextResponse.json({
                message: "Missing required parameters",
                success: false
            }, { status: 400 })
        }

        const docRef = doc(db, 'labels', labelId)
        const docSnap = await getDoc(docRef)
        
        if(!docSnap.exists()){
            return NextResponse.json({
                message: "Label not found",
                success: false
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId: docSnap.data().projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }
        
        await updateDoc(docRef, {
            content: content,
            backgroundColor: backgroundColor,
            updatedAt: serverTimestamp(),
        })

        return NextResponse.json({
            message: "Successfully updated the label",
            success: true,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}

export async function DELETE(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first",
                success: false
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        const { labelId } = response.params
        const docRef = doc(db, 'labels', labelId)
        const docSnap = await getDoc(docRef)

        if(!docSnap.exists()){
            return NextResponse.json({
                message: "Missing parameter",
                success: false
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId: docSnap.data().projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        await deleteDoc(doc(db, "labels", labelId))

        return NextResponse.json({
            message: "Successfully removed the label",
            success: true
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}