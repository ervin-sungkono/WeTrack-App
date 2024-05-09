import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { addDoc, collection, getDocs, doc, getDoc, orderBy, query, where } from "firebase/firestore";
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
                message: "You are not authorized"
            }, { status: 401 })
        }

        const projectId = request.nextUrl.searchParams.get("projectId")
        const { taskStatus } = await request.json()

        if(!projectId){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const newTaskStatus = await addDoc(collection(db, 'taskStatuses'), {
            status: taskStatus,
            projectId: projectId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        });

        if(!newTaskStatus){
            return NextResponse.json({
                message: "Fail to create new task status"
            }, { status: 500 })
        }

        return NextResponse.json({
            data: {
                id: newTaskStatus.id,
                ...newTaskStatus
            },
            message: "Successfully create new task status"
        }, {  status: 200 })

    } catch (error) {
        console.error("Cannot get task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}