import { updateDoc, getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';

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
            projectId,
            assignedTo,
            taskName,
            label,
            statusId,
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

        const projectData = projectSnap.data();
        const taskList = projectData.taskList || [];

        const taskIndex = taskList.findIndex(task => task.id === taskId);

        const taskToUpdate = taskList[taskIndex];

        if (taskIndex === -1) {
            return NextResponse.json({
                message: 'Task not found'
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

        let taskStatusDetails = null;
        if (statusId) {
            const userDocRef = doc(db, 'taskStatuses', statusId);

            const taskStatusSnap = await getDoc(userDocRef);
            if (taskStatusSnap.exists()) {
                taskStatusDetails = taskStatusSnap.data();

            } else {
                return NextResponse.json({
                    message: "The task status not found"
                }, { status: 404 })
            }
        }

        const updatedTask = {
            ...taskToUpdate,
            assignedTo: { assignedTo, assignedToDetails } ?? taskToUpdate.assignedTo,
            taskName: taskName ?? taskToUpdate.taskName,
            label: label ?? taskToUpdate.label,
            status: { statusId, taskStatusDetails } ?? taskToUpdate.status,
            description: description ?? taskToUpdate.description,
            startDate: startDate ?? taskToUpdate.startDate,
            dueDate: dueDate ?? taskToUpdate.dueDate,
            updatedAt: new Date().toISOString(),
        };

        const updatedTaskList = [
            ...taskList.slice(0, taskIndex),
            updatedTask,
            ...taskList.slice(taskIndex + 1),
        ];

        const taskDocRef = doc(db, 'tasks', taskToUpdate.id)
        const taskSnap = await getDoc(taskDocRef)
        
        let taskCollectionToUpdate;
        if (taskSnap.exists()) {
            taskCollectionToUpdate = taskSnap.data();
            
        } else {
            return NextResponse.json({
                message: "Can't find the task collection"
            }, { status: 404 })
        }
        
        //update task collection
        await updateDoc(taskDocRef, {
            assignedTo: { assignedTo, assignedToDetails } ?? taskCollectionToUpdate.assignedTo,
            taskName: taskName ?? taskCollectionToUpdate.taskName,
            label: label ?? taskCollectionToUpdate.label,
            status: { statusId, taskStatusDetails } ?? taskCollectionToUpdate.status,
            description: description ?? taskCollectionToUpdate.description,
            startDate: startDate ?? taskCollectionToUpdate.startDate,
            dueDate: dueDate ?? taskCollectionToUpdate.dueDate,
            updatedAt: new Date().toISOString()
        })
        
        //update task in project collection
        await updateDoc(projectDocRef, {
            taskList: updatedTaskList,
        });

        return NextResponse.json({
            data: updatedTask,
            message: 'Task updated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot update task", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { taskId } = context.params;
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectDocRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "Project not found"
            }, { status: 404 });
        }

        const projectData = projectSnap.data();
        let taskList = projectData.taskList || [];
        const taskIndex = taskList.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            return NextResponse.json({
                data: null,
                message: 'Task not found'
            }, { status: 404 });
        }

        taskList.splice(taskIndex, 1);

        await updateDoc(projectDocRef, {
            taskList: taskList
        });

        return NextResponse.json({
            message: "Task successfully deleted"
        }, { status: 200 });


    } catch (error) {
        console.error("Can't delete task", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}