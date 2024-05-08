import { doc, getDoc, arrayUnion, addDoc, collection, updateDoc, getDocs, query, where, runTransaction } from 'firebase/firestore';
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

        const taskRef = collection(db, 'tasks');

        if (!taskRef) {
            return NextResponse.json({
                data: null,
                message: "Task collection not found"
            }, { status: 404 });
        }

        const q = query(taskRef, where('projectId', '==', projectId))
        if (!q) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }
        
        const querySnapshot = await getDocs(q)

        const tasks = await Promise.all(querySnapshot.docs.map(async (item) => {
            const taskStatusDoc = await getDoc(doc(db, "taskStatuses", item.data().status))
            const taskStatusDetail = {
                id: taskStatusDoc.id,
                ...taskStatusDoc.data()
            }

            return {
                id: item.id,
                taskName: item.data().taskName,
                labels: item.data().labels,
                assignedTo: item.data().assignedTo,
                priority: item.data().priority,
                status: taskStatusDetail
            }
        })) 
        
        return NextResponse.json({
            data: tasks,
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

export async function POST(request, response) {
    try {
        const { 
            projectId, 
            assignedTo,
            typeId,
            taskName,
            labels,
            statusId,
            priority,
            description,
            startDate,
            dueDate
        } = await request.json();

        const session = await getUserSession(request, response, nextAuthOptions)

        console.log("session",session)
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
                    id: userSnap.id,
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
                    id: userSnap.id,
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
            const taskTypeDocRef = doc(db, 'taskTypes', typeId);
            const taskTypeSnap = await getDoc(taskTypeDocRef);

            if (taskTypeSnap.exists()) {
                const { type } = taskTypeSnap.data()
                taskTypeDetails = {
                    id: taskTypeSnap.id,
                    taskType: type
                }

            } else {
                return NextResponse.json({
                    message: "The task type not found"
                }, { status: 404 })
            }
        }

        let taskStatusDetails = null;
        let taskStatusSnap;
        
        if (statusId) {
            const taskStatusDocRef = doc(db, 'taskStatuses', statusId);
            taskStatusSnap = await getDoc(taskStatusDocRef);

            console.log(taskStatusDocRef)
            console.log(taskStatusSnap)
            if (taskStatusSnap.exists()){
                const { statusName } = taskStatusSnap.data()
                taskStatusDetails = {
                    id: taskStatusSnap.id,
                    status: statusName
                }

            } else {
                return NextResponse.json({
                    message: "The task status not found"
                }, { status: 404 })
            }
        }

        let labelDetails = []
        if(labels && labels.length > 0){
            labelDetails = await Promise.all(labels.map(async (label) =>{
                const labelDoc = await getDoc(doc(db, "lables", label))

                if(labelDoc.exists()){
                    return {
                        ...labelDoc.data()
                    }
                }

                return null
            }))
        }

        const newTask = {
            projectId: projectId, 
            assignedTo: assignedTo ?? null,
            type: typeId ?? null,
            createdBy: createdBy ?? null,
            taskName: taskName,
            labels: labels ?? [],
            status: statusId ?? null,
            priority: priority ?? 0,
            description: description ?? null,
            startDate: startDate ?? null,
            dueDate: dueDate ?? null,
            finishedDate: taskStatusSnap.data().statusName == 'Done' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        }

        const tasksCollectionRef = collection(db, 'tasks');
        const newTaskDocRef = await addDoc(tasksCollectionRef, newTask);

        return NextResponse.json({
            data: {
                id: newTaskDocRef.id,
                ...newTask,
                assignedTo: assignedToDetails,
                createdBy: createdByDetails,
                status: taskStatusDetails,
                label: labelDetails
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
