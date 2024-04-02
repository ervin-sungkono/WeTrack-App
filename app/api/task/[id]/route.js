import { updateDoc, getDoc, doc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function GET(request, context) {
    try {
        const { id } = context.params
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectRef = doc(db, "projects", projectId)

        if (!projectRef) {
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 });
        }

        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data()

        if (!projectData) {
            return NextResponse.json({
                message: "Project detail not found"
            }, { status: 404 });
        }

        console.log("task list", projectData.taskList)
        const taskDetail = projectData.taskList.find((task) => task.id === id)

        console.log("task detail", taskDetail)

        if (!taskDetail) {
            return NextResponse.json({
                message: "No task found"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: taskDetail,
            message: "Successfully get Task detail"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get tasks in project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id } = context.params;
        const {
            projectId,
            assignedTo,
            typeId,
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

        const taskIndex = taskList.findIndex(task => task.id === id);

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

        let taskTypeDetails = null;
        if (typeId) {
            const userDocRef = doc(db, 'taskTypes', typeId);
            const taskTypeSnap = await getDoc(userDocRef);
            
            if (taskTypeSnap.exists()) {
                taskTypeDetails = taskTypeSnap.data();

            } else {
                return NextResponse.json({
                    message: "The task type not found"
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
            type: { typeId, taskTypeDetails } ?? taskToUpdate.type,
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
            type: { typeId, taskTypeDetails } ?? taskCollectionToUpdate.type,
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
        const { id } = context.params;
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
        const taskIndex = taskList.findIndex(task => task.id === id);

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