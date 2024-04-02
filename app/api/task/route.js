import { updateDoc, doc, getDoc, arrayUnion, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function GET(request) {
    try {
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectsRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectsRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }

        const taskData = projectSnap.data()
        const taskList = taskData.taskList

        return NextResponse.json({
            data: taskList ?? [],
            message: "Projects retrieved successfully"
        }, { status: 200 });
        
    } catch (error) {
        console.error("Cannot get tasks in the project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { 
            projectId, 
            assignedTo,
            typeId,
            createdBy,
            taskName,
            label,
            statusId,
            description,
            startDate,
            dueDate

        } = await request.json();
        
        if (!projectId ||!typeId ||!createdBy ||!taskName ||!statusId) {
            return NextResponse.json({
                data: null,
                message: "Missing mandatory fields"
            }, { status: 400 });
        }
        
        const projectDocRef = doc(db, 'projects', projectId);

        if(!projectDocRef){
            return NextResponse.json({
                message: "The referred project is not found"
            }, { status: 404 })
        }

        let assignedToDetails = null;
        if (assignedTo) {
            const userDocRef = doc(db, 'users', assignedTo);

            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                assignedToDetails = userSnap.data();
                console.log("assigned to detail", assignedToDetails)

            } else {
                return NextResponse.json({
                    message: "Assigned user not found"
                }, { status: 404 })
            }
        }

        let createdByDetails = null;
        if (createdBy) {
            const userDocRef = doc(db, 'users', createdBy);

            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                createdByDetails = userSnap.data();

            } else {
                return NextResponse.json({
                    message: "The user creator not found"
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

        const newTask = {
            projectId: projectId, 
            assignedTo: assignedTo? { userId: assignedTo, assignedToDetails } : null,
            type: typeId? { typeId, taskTypeDetails } : null,
            createdBy: createdBy? { userId: createdBy, createdByDetails } : null,
            taskName: taskName,
            label: label? label : null,
            status: statusId? { statusId, taskStatusDetails } : null,
            description: description ?? null,
            startDate: startDate ?? null,
            dueDate: dueDate ?? null,
            finishedDate: null,
            comments: [],
            attachments: [],
            AIResponse: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        };

        const tasksCollectionRef = collection(db, 'tasks');
        const taskDocRef = await addDoc(tasksCollectionRef, newTask);

        if (!taskDocRef) {
            return NextResponse.json({
                message: 'Failed to create new task doc'
            }, { status: 404 })
        }

        await updateDoc(projectDocRef, {
            taskList: arrayUnion({
                id: taskDocRef.id,
                taskName: newTask.taskName,
                assignedTo: newTask.assignedTo,
                type: newTask.type,
                status: newTask.status,
                label: newTask.label
            })
        });
        
        return NextResponse.json({
            data: {
                id: taskDocRef.id,
                ...newTask
            },
            message: "Successfully added new task to project and task collection"
        }, { status: 200 });

    } catch (error) {
        console.error("Can't create task", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
