import { db } from "@/app/firebase/config";
import { collection, doc, getDocs } from "firebase/firestore";
import { NextResponse } from 'next/server';

export async function GET(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const loggedIn = session.user.uid

        if(!loggedIn){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectsRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectsRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }

        const taskStatusCollection = collection(db, 'taskStatuses')
        const taskStatusDocs = await getDocs(doc(taskStatusCollection))

        

    } catch (error) {
        console.error("Cannot get tasks in the project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}