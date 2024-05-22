import { db } from "@/app/firebase/config";
import { createHistory, getProjectRole } from "@/app/firebase/util";
import { nextAuthOptions } from "@/app/lib/auth";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { getUserSession } from "@/app/lib/session";
import { addDoc, collection, getDocs, doc, getDoc, orderBy, query, where, serverTimestamp, setDoc } from "firebase/firestore";
import { NextResponse } from 'next/server'

export async function GET(request, response) {
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

        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if(!projectSnap.exists()){
            return NextResponse.json({
                message: "Project not found",
                success: false
            }, { status: 404 });
        }

        const taskStatusColRef = collection(db, 'taskStatuses')
        const q = query(taskStatusColRef, where('projectId', '==', projectId), orderBy('order'))
        const querySnapshot = await getDocs(q)

        let taskStatuses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            status: doc.data().statusName,
            order: doc.data().order
        }))
            
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

export async function POST(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized",
                success: false
            }, { status: 401 })
        }

        const projectId = request.nextUrl.searchParams.get("projectId")
        if(!projectId){
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

        const { statusName } = await request.json()

        if(!statusName){
            return NextResponse.json({
                message: "Missing mandatory fields",
                success: false
            }, { status: 400 })
        }
        
        const taskStatusColRef= collection(db, "taskStatuses")
        const q = query(taskStatusColRef, where("projectId", '==', projectId))
        const querySnapshot = await getDocs(q)
        const order = querySnapshot.docs.length
    
        const newTaskStatus = await addDoc(collection(db, 'taskStatuses'), {
            statusName: statusName,
            projectId: projectId,
            order: order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null
        });

        await setDoc(doc(db, 'taskOrderCounters', newTaskStatus.id), {
            lastOrder: 0,
            updatedAt: serverTimestamp()
        })

        if(!newTaskStatus){
            return NextResponse.json({
                message: "Fail to create new task status",
                success: false
            }, { status: 500 })
        }

        await createHistory({
            userId: userId,
            projectId: projectId,
            action: getHistoryAction.create,
            eventType: getHistoryEventType.status
        })

        return NextResponse.json({
            message: "Successfully create new task status",
            success: true
        }, {  status: 200 })

    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}