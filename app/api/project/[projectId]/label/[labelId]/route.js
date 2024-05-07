import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
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

        const { content, backgroundColor } = await request.json()
        const { labelId } = response.params
        
        if(!backgroundColor){
            return NextResponse.json({
                message: "Missing required parameters"
            }, { status: 400 })
        }

        const docRef = await getDoc(doc(db, 'labels', labelId))
        
        if(!docRef.exists()){
            return NextResponse.json({
                message: "Label not found"
            }, { status: 404 })
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
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { labelId } = response.params

        if(!labelId){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 404 })
        }

        await deleteDoc(doc(db, "labels", labelId))

        return NextResponse.json({
            message: "Successfully removed the label"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}