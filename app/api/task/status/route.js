import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from 'next/server'

export async function GET(request, response, context) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const loggedIn = session.user.uid

        if(!loggedIn){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const projectId = request.nextUrl.searchParams.get("projectId")

        if(!projectId) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const taskStatusColRef = collection(db, 'taskStatuses')
        const q = query(taskStatusColRef, where('projectId', '==', projectId))
        const querySnapshot = await getDocs(q)

        let taskStatuses = [];
        querySnapshot.forEach(doc => {
            taskStatuses.push({
                id: doc.id,
                taskStatus: doc.data().status
            })
            return taskStatuses
        })
            
        return NextResponse.json({
            data: taskStatuses, 
            message: "Succesfully get all available task statuses"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}