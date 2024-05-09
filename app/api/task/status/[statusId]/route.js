import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { getUserSession } from "@/app/lib/session";
import { nextAuthOptions } from "@/app/lib/auth";
import { collection, updateDoc, deleteDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";

export async function PUT(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized",
                success: false
            }, { status: 401 })
        }

        const { statusId } = response.params
        const { statusName } = await request.json()

        const statusRef = doc(db, "taskStatuses", statusId)
        const statusSnap = await getDoc(statusRef)

        if(!statusSnap.exists()){
            return NextResponse.json({
                message: "Status not found",
                success: false
            }, { status: 404 })
        }

        const updatedTask = await updateDoc(statusRef, {
            statusName: statusName,
            updatedAt: serverTimestamp()
        })

        if(!updatedTask){
            return NextResponse.json({
                message: "Fail to update task status",
                success: false
            }, { status: 500 })
        }

        return NextResponse.json({
            message: "Task status updated successfully",
            success: true
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}

export async function DELETE(request, response, context){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { id } = context.params
        const projectId = request.nextUrl.searchParams.get("projectId")

        const taskStatusCol = collection(db, "status")
        
    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}