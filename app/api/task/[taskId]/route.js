import { updateDoc, getDoc, doc, collection, query, where, getDocs, deleteDoc, serverTimestamp, and } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory, createNotification, deleteAttachments, deleteTask, getProjectRole } from '@/app/firebase/util';
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
                    subTasks: !subTaskDocs.empty ? subTasks : []
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

        const projectData = await getDoc(doc(db, "projects", taskData.projectId))
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

        if(taskData.type == 'SubTask' && parentId) {
            const parentTaskSnap = await getDoc(doc(db, "tasks", parentId))
    
            if(!parentTaskSnap.exists()) {
                return NextResponse.json({
                    message: "Parent task not found"
                }, { status: 404 })
            }

            if(parentTaskSnap.data()?.projectId != taskData.projectId) {
                return NextResponse.json({
                    message: "Parent id is not found in the project"
                }, { status: 400 })
            }
        }

        const projectRole = await getProjectRole({ projectId: taskData.projectId, userId })
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        // Validate assigned to id
        if (assignedTo) {
            const userDocRef = doc(db, 'users', assignedTo);
            const userSnap = await getDoc(userDocRef);
            if(!userSnap.exists()) {
                return NextResponse.json({
                    message: "Assigned user not found"
                }, { status: 404 })
            }

            const q = query(collection(db, "teams"), and(where("projectId", '==', taskData.projectId), where("userId", '==', assignedTo)))
            const querySnapshot = await getDocs(q)

            if(querySnapshot.empty) {
                return NextResponse.json({
                    message: "Can't assign task to user not in project"
                }, { status: 404 }) 
            }
        }

        if(labels && labels.length > 0){
            await Promise.all(labels.map(async (label) =>{
                const labelDoc = await getDoc(doc(db, "labels", label)) 
                if(!labelDoc.exists()){
                    throw new Error("Label doesn't exists")
                }
                if(labelDoc.data()?.projectId != taskData.projectId) {
                    throw new Error("Label doesn't exist in the project")
                }
            }))
        }
        
        await updateDoc(taskDocRef, {
            parentId: parentId ?? taskData.parentId,
            assignedTo: assignedTo !== undefined ? assignedTo : taskData.assignedTo,
            taskName: taskName ?? taskData.taskName,
            priority: priority ?? taskData.priority,
            labels: labels !== undefined ? labels : taskData.labels,
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

            else if((updatedTaskData.assignedTo != taskData.assignedTo)) {
                const oldAssignedToValue = taskData.assignedTo == null ? null : await getDoc(doc(db, "users", taskData.assignedTo))
                const newAssignedToValue = updatedTaskData.assignedTo == null ? null : await getDoc(doc(db, "users", updatedTaskData.assignedTo))

                await createHistory({
                    userId: userId,
                    taskId: taskId,
                    projectId: taskData.projectId,
                    action: getHistoryAction.update,
                    eventType: getHistoryEventType.assignedTo,
                    previousValue: taskData.assignedTo == null ? null : {...oldAssignedToValue.data()},
                    newValue: updatedTaskData.assignedTo == null ? null : {...newAssignedToValue.data()}
                })
            }

            else {
                await createHistory({
                    userId: userId,
                    taskId: taskId,
                    projectId: taskData.projectId,
                    action: getHistoryAction.update,
                    eventType: updatedTaskData.type == 'Task' ? getHistoryEventType.task  : getHistoryEventType.subtask
                })
            }

            if(assignedTo !== undefined && updatedTaskData.assignedTo !== null){
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

        const projectData = await getDoc(doc(db, "projects", taskDoc.data().projectId))
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

        const taskName = taskDoc.data().taskName

        const projectRole = await getProjectRole({ projectId: taskDoc.data().projectId, userId})
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        await deleteTask({ taskId: taskId, userId: userId }) 
        await deleteAttachments({ taskId: taskId })

        await createHistory({ 
            userId: userId,
            taskId: taskId,
            projectId: taskDoc.data().projectId,
            eventType: taskDoc.data().type == 'Task' ? getHistoryEventType.task : getHistoryEventType.subtask,
            action: getHistoryAction.delete,
            deletedValue: taskName
        })

        if(taskDoc.data().status !== null && taskDoc.data().type == "Task") {
            const currentLastOrderDoc = await getDoc(doc(db, "taskOrderCounters", taskDoc.data().status))
            const currentLastOrder = currentLastOrderDoc.data().lastOrder

            await updateDoc(doc(db, "taskOrderCounters", taskDoc.data().status), {
                lastOrder: currentLastOrder == 0 ? currentLastOrder : currentLastOrder - 1,
                updatedAt: serverTimestamp()
            })
        }

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