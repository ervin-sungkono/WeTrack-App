import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { getUserSession } from "@/app/lib/session";
import { nextAuthOptions } from "@/app/lib/auth";
import { collection, updateDoc, deleteDoc, getDoc, doc, serverTimestamp, where, getDocs } from "firebase/firestore";

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

export async function DELETE(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { statusId } = response.params
        const projectId = request.nextUrl.searchParams.get("projectId")
        if(!statusId || !projectId){
            return NextResponse.json({
                message: "Missing parameter",
                success: false
            }, { status: 400 })
        }

        const statusRef = doc(db, "taskStatuses", statusId)
        const statusSnap = await getDoc(statusRef)
        if(!statusSnap.exists()){
            return NextResponse.json({
                message: "Task status not found",
                success: false
            }, { status: 404 })
        }

        const projectRef = doc(db, "projects", projectId)
        const projectSnap = await getDoc(projectRef)
        if(!projectSnap.exists()){
            return NextResponse.json({
                message: "Project not found",
                success: false
            }, { status: 404 })
        }

        const taskStatusColRef = collection(db, "status")
        const q = query(taskStatusColRef, where("projectId", '==', projectId))
        const querySnapshot = await getDocs(q)
        const taskStatusLength = querySnapshot.docs.length

        if(taskStatusLength === 1){
            return NextResponse.json({
                message: "Task status length cannot be less than one",
                success: false
            }, { status: 406 })
        }

        const { newStatusId } = await request.json()
        const startStatusId = statusId === projectSnap.data().startStatus ? newStatusId : projectSnap.data().startStatus
        const endStatusId = statusId === projectSnap.data().endStatus ? newStatusId : projectSnap.data().endStatus

        await updateDoc(projectRef, {
            startStatus: startStatusId,
            endStatus: endStatusId
        })

        const taskColRef = collection(db, "tasks")
        const taskQuery = query(taskColRef, where("status", '==', statusId))
        const taskSnapshot = await getDocs(taskQuery)

        const updatedTasks = await Promise.all(taskSnapshot.docs.map(async(doc) => {
            return await updateDoc(doc.ref, {
                status: newStatusId
            })
        }))

        console.log(updatedTasks)

        await deleteDoc(statusRef)
        return NextResponse.json({
            message: "Task status deleted successfully",
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