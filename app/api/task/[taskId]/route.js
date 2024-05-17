import { updateDoc, getDoc, doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory, createNotification } from '@/app/firebase/util';

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

        const taskRef = doc(db, "tasks", taskId)
        const taskSnap = await getDoc(taskRef);

        const subTaskRef = collection(db, "tasks")
        const q = query(subTaskRef, where("parentId", "==", taskId))
        const subTaskDocs = await getDocs(q)

        const subTasks = subTaskDocs.docs.map(item => ({
                id: item.id,
                taskName: item.data().taskName
        }))
        
        if(taskSnap.exists()){
            const taskData = taskSnap.data()
            return NextResponse.json({
                data: {
                    id: taskSnap.id,
                    ...taskData,
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
            assignedTo,
            taskName,
            labels,
            priority,
            description,
            startDate,
            dueDate
        } = await request.json();

        const projectDocRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
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

        const taskDocRef = doc(db, 'tasks', taskId)
        const taskSnap = await getDoc(taskDocRef)
        
        if(!taskSnap.exists()) {
            return NextResponse.json({
                message: "Task not found"
            }, { status: 404 })
        }

        const taskData = taskSnap.data()

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
            assignedTo: assignedTo ?? taskData.assignedTo,
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

        await deleteDoc(taskDocRef) 

        await createHistory({ 
            userId: userId,
            taskId: taskId,
            projectId: taskDoc.data().projectId,
            eventType: "Task",
            action: "delete"
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