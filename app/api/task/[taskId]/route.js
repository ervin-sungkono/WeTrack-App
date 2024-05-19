import { updateDoc, getDoc, doc, collection, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory, createNotification, getProjectRole } from '@/app/firebase/util';
import { getHistoryAction, getHistoryEventType } from '@/app/lib/history';

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params

        if(!taskId) {
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const taskRef = doc(db, "tasks", taskId)
        const taskSnap = await getDoc(taskRef);
        if(!taskSnap.exists()) {
            return NextResponse.json({
                message: "Task not found"
            }, { status: 404 })
        }

        const subTaskRef = collection(db, "tasks")
        const q = query(subTaskRef, where("parentId", "==", taskId))
        const subTaskDocs = await getDocs(q)

        const subTasks = subTaskDocs.docs.map(item => ({
                id: item.id,
                taskName: item.data().taskName
        }))

        const labelsData = taskSnap.data().labels
        let labels

        if(labelsData.length > 0) {
            labels = await Promise.all(labelsData.map(async (label) => {
                const labelDoc = await getDoc(doc, "labels", label)

                return {
                    id: labelDoc.id,
                    ...labelDoc.data() 
                }
            }))
        }
        
        if(taskSnap.exists()){
            const taskData = taskSnap.data()
            return NextResponse.json({
                data: {
                    id: taskSnap.id,
                    ...taskData,
                    labels: labels,
                    subTasks: subTasks
                },
                message: "Successfully get Task detail"
            }, { status: 200 })
        }

        return NextResponse.json({
            data: null,
            message: "Fail to get task detail"
        }, { status: 404 })

    } catch (error) {
        console.error("Cannot get tasks in project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params;
        const {
            parentId,
            assignedTo,
            taskName,
            labels,
            priority,
            description,
            startDate,
            dueDate
        } = await request.json();
        
        const taskDocRef = doc(db, 'tasks', taskId)
        const taskSnap = await getDoc(taskDocRef)
        
        if(!taskSnap.exists()) {
            return NextResponse.json({
                message: "Task not found"
            }, { status: 404 })
        }

        const taskData = taskSnap.data()

        if(taskData.type == 'SubTask') {
            if(!parentId) {
                return NextResponse.json({
                    message: "Missing parameter"
                }, { status: 400 })
            }

            const parentTaskSnap = await getDoc(doc(db, "tasks", parentId))
    
            if(!parentTaskSnap.exists()) {
                return NextResponse.json({
                    message: "Parent task not found"
                }, { status: 404 })
            }
        }

        const projectRole = await getProjectRole({ projectId: taskData.projectId, userId })
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }
        
        let assignedToDetails = null;
        if (assignedTo) {
            const userDocRef = doc(db, 'users', assignedTo);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                assignedToDetails = userSnap.data();

            } else {
                return NextResponse.json({
                    message: "Assigned user not found"
                }, { status: 404 })
            }
        }

        if(labels.length > 0) {
            labels.forEach(async (label) => {
                const labelDoc = await getDoc(doc(db, "labels", label))
                if(!labelDoc.exists) {
                    return NextResponse.json({
                        message: "Label not found"
                    }, { status: 400 })
                }
            });
        }
        
        await updateDoc(taskDocRef, {
            parentId: parentId ?? taskData.parentId,
            assignedTo: assignedTo ? assignedTo : taskData.assignedTo,
            taskName: taskName ?? taskData.taskName,
            priority: priority ?? taskData.priority,
            labels: labels ?? taskData.labels,
            description: description ?? taskData.description,
            startDate: startDate ?? taskData.startDate,
            dueDate: dueDate ?? taskData.dueDate,
            updatedAt: new Date().toISOString()
        })

        const updatedTaskSnap = await getDoc(taskDocRef)
        if(updatedTaskSnap.exists()){
            const updatedTaskData = updatedTaskSnap.data()

            if(taskName && (updatedTaskData.taskName != taskData.taskName)) {
                await createHistory({
                    userId: userId,
                    taskId: taskId,
                    projectId: taskData.projectId,
                    action: getHistoryAction.update,
                    eventType: getHistoryEventType.taskName,
                    previousValue: taskData.taskName,
                    newValue: updatedTaskData.taskName
                })
            }

            if(updatedTaskData.assignedTo){
                await createNotification({
                    userId: updatedTaskData.assignedTo,
                    taskId: taskId,
                    projectId: updatedTaskData.projectId,
                    type: 'AssignedTask'
                })
            }
        }
        
        return NextResponse.json({
            success: true,
            message: 'Task updated successfully'
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params;
        const taskDocRef = doc(db, "tasks", taskId)
        const taskDoc = await getDoc(taskDocRef)
        if(!taskDoc.exists()) {
            return NextResponse.json({
                message: "Task not found"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId: taskDoc.data().projectId, userId})
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        await deleteDoc(taskDocRef) 

        if(taskDoc.data().status !== null) {
            const currentLastOrderDoc = await getDoc(doc(db, "taskOrderCounters", taskDoc.data().status))
            const currentLastOrder = currentLastOrderDoc.data().lastOrder

            await updateDoc(doc(db, "taskOrderCounters", taskDoc.data().status), {
                lastOrder: currentLastOrder == 0 ? currentLastOrder : currentLastOrder - 1,
                updatedAt: serverTimestamp()
            })
        }

        await createHistory({ 
            userId: userId,
            taskId: taskId,
            projectId: taskDoc.data().projectId,
            eventType: getHistoryEventType.task,
            action: getHistoryAction.delete
        })

        return NextResponse.json({
            success: true,
            message: "Task successfully deleted"
        }, { status: 200 });


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}