import { doc, getDoc, collection, getDocs, query, where, runTransaction, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory } from '@/app/firebase/util';
import { getProjectRole } from '@/app/firebase/util';

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
                displayId: item.data().displayId,
                taskName: item.data().taskName,
                labels: item.data().labels,
                assignedTo: item.data().assignedTo,
                priority: item.data().priority,
                createdAt: item.data().createdAt,
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
            type,
            parentId,
            taskName,
            labels,
            statusId,
            priority,
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
        
        if (!projectId ||!taskName ||!statusId ||!type) {
            return NextResponse.json({
                data: null,
                message: "Missing mandatory fields"
            }, { status: 400 });
        }
        
        const projectDocRef = doc(db, 'projects', projectId);
        const projectDocSnap = await getDoc(projectDocRef)

        if(!projectDocSnap.exists()){
            return NextResponse.json({
                message: "The referred project is not found"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId, userId: createdBy})
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

        if(type == 'Task' && parentId) {
            return NextResponse.json({
                message: "Task can't have a parent task"
            }, { status: 404 })
        }

        if(type == 'SubTask' && !parentId) {
            return NextResponse.json({
                message: "Sub task must have a parent task"
            }, { status: 404 })
        }

        let taskStatusDetails = null;
        let taskStatusSnap;
        
        if (statusId) {
            const taskStatusDocRef = doc(db, 'taskStatuses', statusId);
            taskStatusSnap = await getDoc(taskStatusDocRef);
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
                const labelDoc = await getDoc(doc(db, "labels", label))
                if(labelDoc.exists()){
                    return {
                        ...labelDoc.data()
                    }
                }
                return null
            }))
        }

        const result = await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, 'taskOrderCounters', statusId);
            const counterSnap = await transaction.get(counterRef);
            
            const displayIdCounterRef = doc(db, 'displayIdCounters', projectId);
            const displayIdCounterSnap = await transaction.get(displayIdCounterRef);

            const newTaskDocRef = doc(collection(db, 'tasks'));
            const newTask = {
                projectId,
                assignedTo: assignedTo ?? null,
                type: type,
                parentId: parentId ?? null,
                createdBy,
                taskName,
                labels: labels ?? [],
                status: statusId ?? null,
                displayId: displayIdCounterSnap.exists() ? displayIdCounterSnap.data().displayId : 1,
                order: counterSnap.exists() ? counterSnap.data().lastOrder : 0,
                priority: priority ?? 0,
                description: description ?? null,
                startDate: startDate ?? null,
                dueDate: dueDate ?? null,
                finishedDate: taskStatusDetails.status === 'Done' ? new Date().toISOString() : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
            };

            transaction.set(newTaskDocRef, newTask);
            if (!counterSnap.exists()) {
                transaction.set(counterRef, { 
                    lastOrder: 1,
                    updatedAt: serverTimestamp()
                });
            } else {
                transaction.update(counterRef, { 
                    lastOrder: counterSnap.data().lastOrder + 1,
                    updatedAt: serverTimestamp()
                });
            }

            if(!displayIdCounterSnap.exists()) {
                transaction.set(displayIdCounterRef, {
                    displayId: 2,
                    updatedAt: serverTimestamp()
                })
            } else {
                transaction.update(displayIdCounterRef, {
                    displayId: displayIdCounterSnap.data().displayId + 1,
                    updatedAt: serverTimestamp()
                })
            }

            return {
                id: newTaskDocRef.id,
                ...newTask
            };
        });

        await createHistory({ 
            userId: createdBy, 
            taskId: result.id, 
            projectId: projectId, 
            eventType: "Task", 
            action: "create" 
        })

        return NextResponse.json({
            data: {
                id: result.id,
                ...result,
                assignedTo: assignedToDetails,
                createdBy: createdByDetails,
                status: taskStatusDetails,
                labels: labelDetails
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
