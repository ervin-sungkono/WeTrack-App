import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, query, where } from "firebase/firestore";
import { getProjectRole } from "@/app/firebase/util";
import { NextResponse } from "next/server";

export async function GET(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);

        const userId = session?.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { projectId } = response.params

        const labelColRef = collection(db, 'labels')
        const q = query(labelColRef, where("projectId", '==', projectId))
        const querySnapshot = await getDocs(q)

        const labels = querySnapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }))

        return NextResponse.json({
            data: labels,
            message: "Successfully get all label"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response){
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
        const { projectId } = response.params
        
        if(!backgroundColor){
            return NextResponse.json({
                message: "Missing required parameters"
            }, { status: 400 })
        }

        const docSnap = await getDoc(doc(db, 'projects', projectId))
        
        if(!docSnap.exists()){
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }
        
        const labelCollection = collection(db, "labels")
        await addDoc(labelCollection, {
            projectId: projectId,
            content: content,
            backgroundColor: backgroundColor,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null,
        })

        return NextResponse.json({
            message: "Successfully added the label",
            success: true,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}