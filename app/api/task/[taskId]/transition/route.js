import { addDoc, updateDoc, getDoc, doc, collection, where, orderBy, getDocs, query, serverTimestamp, and, setDoc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory } from '@/app/firebase/util';
import { getHistoryAction, getHistoryEventType } from '@/app/lib/history';
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

        const { taskId } = response.params
        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);

        if(!taskSnap.exists()){
            return NextResponse.json({
                message: "Task not found",
                success: false
            }, { status: 404 });
        }

        const projectData = await getDoc(doc(db, "projects", taskSnap.data().projectId))
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

        const projectRole = await getProjectRole({projectId: taskSnap.data().projectId, userId})
        console.log(projectRole)
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 });
        }

        const {
            newStatusId,
            oldIndex,
            newIndex
        } = await request.json();

        if(!taskId || (oldIndex == null && taskSnap.data().type !== 'SubTask')) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const taskStatusDocRef = doc(db, 'taskStatuses', newStatusId);
        const taskStatusSnap = await getDoc(taskStatusDocRef);
        
        if(!taskStatusSnap.exists()){
            return NextResponse.json({
                message: "Task status not found",
                success: false
            }, { status: 404 });
        }

        const currentTaskStatusDocRef = doc(db, 'taskStatuses', taskSnap.data().status);
        const currentTaskStatusSnap = await getDoc(currentTaskStatusDocRef);

        if(taskSnap.data().type === 'SubTask'){
            await updateDoc(taskRef, {
                status: newStatusId,
                updatedAt: serverTimestamp()
            })

            await createHistory({
                userId: userId,
                taskId: taskId,
                projectId: taskSnap.data().projectId,
                action: getHistoryAction.update,
                eventType: getHistoryEventType.taskStatus,
                previousValue: currentTaskStatusSnap.data().statusName,
                newValue: taskStatusSnap.data().statusName
            })

            return NextResponse.json({
                message: 'SubTask updated successfully',
                success: true
            }, { status: 200 });
        }

        // if the old status is equal to new status
        if(taskSnap.data().status === newStatusId){
            const q = query(collection(db, 'tasks'), and(where('status', '==', newStatusId), where('type', '==', 'Task')), orderBy('order'))
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
            const q = query(collection(db, 'tasks'), and(where('status', '==', taskSnap.data().status), where('type', '==', 'Task')), orderBy('order'))
            const querySnapshot = await getDocs(q)
            const taskDocList = querySnapshot.docs.map(doc => ({
                ref: doc.ref,
                order: doc.data().order
            }))

            // Get old status order reference
            const statusCounterRef = doc(db, "taskOrderCounters", taskSnap.data().status)
            const statusCounterSnap = await getDoc(statusCounterRef)

            // Get new status order reference
            const newStatusCounterRef = doc(db, "taskOrderCounters", newStatusId)
            const newStatusCounterSnap = await getDoc(newStatusCounterRef)


            const newIndexOrder = newIndex ?? (newStatusCounterSnap.exists() ? newStatusCounterSnap.data().lastOrder : 0)

            // Update the order for the other task
            for(let i = newIndexOrder; i < taskDocList.length; i++){
                await updateDoc(taskDocList[i].ref, {
                    order: i + 1,
                    updatedAt: serverTimestamp()
                })
            }

            // Update the old status order counter
            if(!statusCounterSnap.exists()){
                await setDoc(statusCounterRef, {
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
                order: newIndexOrder,
                updatedAt: serverTimestamp()
            })

            // Update the new status order counter
            if(!newStatusCounterSnap.exists()){
                await setDoc(newStatusCounterRef, {
                    lastOrder: 0,
                    updatedAt: serverTimestamp()
                })
            }else{
                await updateDoc(newStatusCounterRef, {
                    lastOrder: newStatusCounterSnap.data().lastOrder + 1,
                    updatedAt: serverTimestamp()
                })
            }    

            await createHistory({
                userId: userId,
                taskId: taskId,
                projectId: taskSnap.data().projectId,
                action: getHistoryAction.update,
                eventType: getHistoryEventType.taskStatus,
                previousValue: currentTaskStatusSnap.data().statusName,
                newValue: taskStatusSnap.data().statusName
            })
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