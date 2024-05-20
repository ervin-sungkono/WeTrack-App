import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { getUserSession } from "@/app/lib/session";
import { nextAuthOptions } from "@/app/lib/auth";
import { createHistory, getProjectRole } from "@/app/firebase/util";
import { collection, updateDoc, deleteDoc, getDoc, doc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

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

        if(!statusId) {
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        if(!statusName) {
            return NextResponse.json({
                message: "Missing payload"
            }, { status: 400 })
        }

        const statusRef = doc(db, "taskStatuses", statusId)
        const statusSnap = await getDoc(statusRef)

        if(!statusSnap.exists()){
            return NextResponse.json({
                message: "Status not found",
                success: false
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId: statusSnap.data().projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        await updateDoc(statusRef, {
            statusName: statusName ?? statusSnap.data().statusName,
            updatedAt: serverTimestamp()
        })

        const newTaskStatus = await getDoc(doc(db, "taskStatuses", statusId))
        if(newTaskStatus.exists()) {
            await createHistory({
                userId: userId,
                projectId: statusSnap.data().projectId,
                action: "update",
                eventType: "Task Status",
                previousValue: statusSnap.data().statusName,
                newValue: newTaskStatus.data().statusName
            })
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

        const projectRef = doc(db, "projects", projectId)
        const projectSnap = await getDoc(projectRef)
        if(!projectSnap.exists()){
            return NextResponse.json({
                message: "Project not found",
                success: false
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const statusRef = doc(db, "taskStatuses", statusId)
        const statusSnap = await getDoc(statusRef)
        if(!statusSnap.exists()){
            return NextResponse.json({
                message: "Task status not found",
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
        if(!newStatusId){
            return NextResponse.json({
                message: "New Task Status id not found",
                success: false
            }, { status: 404 })
        }

        const newStatusRef = doc(db, "taskStatuses", newStatusId)
        const newStatusSnap = await getDoc(newStatusRef)
        if(!newStatusSnap.exists()){
            return NextResponse.json({
                message: "New Task status not found",
                success: false
            }, { status: 404 })
        }

        const startStatusId = statusId === projectSnap.data().startStatus ? newStatusId : projectSnap.data().startStatus
        const endStatusId = statusId === projectSnap.data().endStatus ? newStatusId : projectSnap.data().endStatus

        await updateDoc(projectRef, {
            startStatus: startStatusId,
            endStatus: endStatusId
        })

        const taskColRef = collection(db, "tasks")
        const taskQuery = query(taskColRef, where("status", '==', statusId))
        const taskSnapshot = await getDocs(taskQuery)

        const statusCounterRef = doc(db, "taskOrderCounters", statusId)
        const statusCounterSnap = await getDoc(statusCounterRef)
        const newStatusCounterRef = doc(db, "taskOrderCounters", newStatusId)
        const newStatusCounterSnap = await getDoc(newStatusCounterRef)

        await Promise.all(taskSnapshot.docs.map(async(doc, index) => {
            return await updateDoc(doc.ref, {
                status: newStatusId,
                order: newStatusCounterSnap.data().lastOrder + index,
                updatedAt: serverTimestamp(),
            })
        }))

        await updateDoc(newStatusCounterRef, {
            lastOrder: statusCounterSnap.data().lastOrder + newStatusCounterSnap.data().lastOrder,
            updatedAt: serverTimestamp()
        })

        await deleteDoc(statusRef)
        await deleteDoc(statusCounterRef)

        await createHistory({
            userId: userId,
            projectId: projectId,
            action: "delete",
            eventType: "Task Status"
        })

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