import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { updateDoc, doc, getDoc, serverTimestamp, writeBatch, query, collection, where, getDocs, arrayRemove } from "firebase/firestore";
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

        const projectData = await getDoc(doc(db, "projects", docSnap.data().projectId))
        if(!projectData.exists()) {
            return NextResponse.json({
                success: false,
                message: "Project doesn't exists"
            }, { status: 404 })
        }

        if(projectData.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }
        
        await updateDoc(docRef, {
            content: content ?? projectData.data().content,
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

        const projectData = await getDoc(doc(db, "projects", docSnap.data().projectId))
        if(!projectData.exists()) {
            return NextResponse.json({
                success: false,
                message: "Project doesn't exists"
            }, { status: 404 })
        }

        if(projectData.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const batch = writeBatch(db)

        const tasksQuery = query(collection(db, 'tasks'), where('labels', 'array-contains', labelId))
        const tasksWithLabelSnapshot = await getDocs(tasksQuery)

        tasksWithLabelSnapshot.docs.forEach((taskDoc) => {
            batch.update(taskDoc.ref, {
                labels: arrayRemove(labelId)
            })
        })

        const labelRef = doc(db, "labels", labelId)
        batch.delete(labelRef)

        await batch.commit()

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