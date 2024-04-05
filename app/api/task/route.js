import { updateDoc, doc, getDoc, arrayUnion, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const loggedIn = session.user.uid

        if(!loggedIn){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

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
            taskName,
            label,
            statusId,
            description,
            startDate,
            dueDate

        } = await request.json();

        const session = await getUserSession(request, response, nextAuthOptions)
        const createdBy = session.user.uid

        if(!createdBy){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }
        
        if (!projectId ||!taskName ||!statusId) {
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
                const { fullName, profileImage } = userSnap.data();
                assignedToDetails = { 
                    fullName: fullName,
                    profileImage: profileImage
                }
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
                const { fullName, profileImage } = userSnap.data();
                createdByDetails = { 
                    fullName: fullName,
                    profileImage: profileImage
                }

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
                const { type } = taskTypeSnap.data()
                taskTypeDetails = {
                    taskType: type
                }

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
                const { status } = taskStatusSnap.data()
                taskStatusDetails = {
                    status: status
                }

            } else {
                return NextResponse.json({
                    message: "The task status not found"
                }, { status: 404 })
            }
        }

        const newTask = {
            projectId: projectId, 
            assignedTo: assignedTo ? { id: assignedTo, ...assignedToDetails } : null,
            type: typeId ? { id: typeId, ...taskTypeDetails } : null,
            createdBy: createdBy ? { id: createdBy, ...createdByDetails } : null,
            taskName: taskName,
            label: label ? label : null,
            status: statusId ? { id: statusId, ...taskStatusDetails } : null,
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
