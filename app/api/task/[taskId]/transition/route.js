import { addDoc, updateDoc, getDoc, doc, collection, where, orderBy, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';

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

        const { taskId } = response.params
        const {
            newStatusId,
            oldIndex,
            newIndex
        } = await request.json();

        if(!taskId) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);

        if(!taskSnap.exists()){
            return NextResponse.json({
                message: "Task not found",
                success: false
            }, { status: 404 });
        }

        const taskStatusDocRef = doc(db, 'taskStatuses', newStatusId);
        const taskStatusSnap = await getDoc(taskStatusDocRef);
        
        if(!taskStatusSnap.exists()){
            return NextResponse.json({
                message: "Task status not found",
                success: false
            }, { status: 404 });
        }

        // if the old status is equal to new status
        if(taskSnap.data().status === newStatusId){
            const q = query(collection(db, 'tasks'), where('status', '==', taskSnap.data().status), orderBy('order'))
            const querySnapshot = await getDocs(q)
            const taskDocList = querySnapshot.docs.map(doc => ({
                ref: doc.ref,
                order: doc.data().order
            }))
            // update status order collection
            await updateDoc(taskRef, {
                order: newIndex,
                updatedAt: serverTimestamp()
            })

            if(newIndex > oldIndex){
                for(let i = oldIndex; i < newIndex; i++){
                    await updateDoc(taskDocList[i + 1].ref, {
                        order: i,
                        updatedAt: serverTimestamp()
                    })
                }
            }
            else if(newIndex < oldIndex){
                for(let i = oldIndex; i > newIndex; i--){
                    await updateDoc(taskDocList[i - 1].ref, {
                        order: i,
                        updatedAt: serverTimestamp()
                    })
                }
            }
        }
        else{
            // Get the new status task query
            const q = query(collection(db, 'tasks'), where('status', '==', newStatusId), orderBy('order'))
            const querySnapshot = await getDocs(q)
            const taskDocList = querySnapshot.docs.map(doc => ({
                ref: doc.ref,
                order: doc.data().order
            }))

            // Update the order for the other task
            for(let i = newIndex; i < taskDocList.length; i++){
                await updateDoc(taskDocList[i].ref, {
                    order: i + 1,
                    updatedAt: serverTimestamp()
                })
            }

            // Update the old status order counter
            const statusCounterRef = doc(db, "taskOrderCounters", taskSnap.data().status)
            const statusCounterSnap = await getDoc(statusCounterRef)

            if(!statusCounterSnap.exists()){
                await addDoc(statusCounterRef, {
                    lastOrder: 0,
                    updatedAt: serverTimestamp()
                })
            }else{
                await updateDoc(statusCounterRef, {
                    lastOrder: statusCounterSnap.data().lastOrder - 1,
                    updatedAt: serverTimestamp()
                })
            }  

            // Move the task to the new document
            await updateDoc(taskRef, {
                status: newStatusId,
                order: newIndex,
                updatedAt: serverTimestamp()
            })

            // Update the new status order counter
            const newStatusCounterRef = doc(db, "taskOrderCounters", newStatusId)
            const newStatusCounterSnap = await getDoc(newStatusCounterRef)

            if(!newStatusCounterSnap.exists()){
                await addDoc(newStatusCounterRef, {
                    lastOrder: newStatusCounterSnap.data().lastOrder + 1,
                    updatedAt: serverTimestamp()
                })
            }else{
                await updateDoc(newStatusCounterRef, {
                    lastOrder: newStatusCounterSnap.data().lastOrder + 1,
                    updatedAt: serverTimestamp()
                })
            }  
        }

        

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