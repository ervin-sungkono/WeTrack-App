import { updateDoc, getDoc, doc, collection, where, orderBy, getDocs, query, writeBatch } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { getProjectRole } from '@/app/firebase/util';

export async function POST(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        const projectId = request.nextUrl.searchParams.get("projectId")
        const { statusId } = response.params;
        const {
            oldIndex,
            newIndex
        } = await request.json();

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

        if(projectSnap.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 });
        }

        const taskStatusDocRef = doc(db, 'taskStatuses', statusId);
        const taskStatusSnap = await getDoc(taskStatusDocRef);
        
        if(!taskStatusSnap.exists()){
            return NextResponse.json({
                message: "Task status not found",
                success: false
            }, { status: 404 });
        }

        const batch = writeBatch(db)

        const q = query(collection(db, 'taskStatuses'), where('projectId', '==', projectId), orderBy('order'))
        const querySnapshot = await getDocs(q)
        const taskDocList = querySnapshot.docs.map(doc => ({
            ref: doc.ref,
            order: doc.data().order
        }))

        // update status order collection
        batch.update(taskStatusDocRef, {
            order: newIndex
        })
        // await updateDoc(taskStatusDocRef, {
        //     order: newIndex
        // })

        if(newIndex > oldIndex){
            for(let i = oldIndex; i < newIndex; i++){
                batch.update(taskDocList[i + 1].ref, {
                    order: i
                })
                // await updateDoc(taskDocList[i + 1].ref, {
                //     order: i
                // })
            }
        }
        else if(newIndex < oldIndex){
            for(let i = oldIndex; i > newIndex; i--){
                batch.update(taskDocList[i - 1].ref, {
                    order: i
                })
                // await updateDoc(taskDocList[i - 1].ref, {
                //     order: i
                // })
            }
        }

        await batch.commit()

        return NextResponse.json({
            message: 'Task updated successfully',
            success: true
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot update task", error);
        return NextResponse.json({
            message: error.message,
            success: false
        }, { status: 500 });
    }
}