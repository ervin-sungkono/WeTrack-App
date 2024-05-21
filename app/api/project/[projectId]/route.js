import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory } from '@/app/firebase/util';
import { getProjectRole } from '@/app/firebase/util';
import { getHistoryAction, getHistoryEventType } from '@/app/lib/history';

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }
        
        const { projectId }  = response.params;

        const projectDocRef = doc(db, 'projects', projectId);

        if(!projectDocRef) {
            return  NextResponse.json({
                message: "Project not found"
            }, { status: 404 });
        }

        const projectSnap = await getDoc(projectDocRef);
        const projectData = projectSnap.data()

        if(!projectData) {
            return  NextResponse.json({
                message: "Project detail not found"
            }, { status: 404 });
        }

        return  NextResponse.json({
            data: {
                id: projectSnap.id,
                ...projectData
            },
            message: "Successfully retrieved project"
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot get project detail", error);
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
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { projectId }  = response.params;
        const { key, projectName, startStatus, endStatus } = await request.json();

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }
        
        if(!key ||!projectName ||!startStatus ||!endStatus) {
            return NextResponse.json({
                message: "Missing payload"
            }, { status: 400 })
        }

        const projectDocRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);
        const projectData = projectSnap.data()

        if(!projectSnap.exists()){
            return NextResponse.json({
                data: null,
                message: "Project not found"
            }, { status: 404 })
        }
        
        const startStatusDoc = await getDoc(doc(db, "taskStatuses", startStatus))
        if(!startStatusDoc.exists()) {
            return NextResponse.json({
                message: "Start status not found"
            }, { status: 404 })
        
        }
        const endStatusDoc = await getDoc(doc(db, "taskStatuses", endStatus))
        if(!endStatusDoc.exists()) {
            return NextResponse.json({
                message: "End status not found"
            }, { status: 404 })
        }
        
        await updateDoc(projectDocRef, {
            key: key ?? projectData.key,
            projectName: projectName ?? projectData.projectName,
            startStatus: startStatus ?? projectData.startStatus,
            endStatus: endStatus ?? projectData.endStatus,
            updatedAt: serverTimestamp()
        });

        await createHistory({ 
            userId: userId,
            projectId: projectId,
            action: getHistoryAction.update,
            eventType: getHistoryEventType.project
        })

        const updatedProjectSnap = await getDoc(projectDocRef);

        if (!updatedProjectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        } 

        if (startStatus != updatedProjectSnap.data().startStatus) {
            const q = query(collection(db, "tasks"), where("status", "==", projectData.startStatus));
            const taskSnapShot = await getDocs(q);
        
            if (!taskSnapShot.empty) {
                const updateTasks = taskSnapShot.docs.map(async (item) => {
                    const taskDocRef = doc(db, "tasks", item.id);
                    const taskDoc = await getDoc(taskDocRef);
        
                    if (!taskDoc.exists()) {
                        throw new Error("Something went wrong when updating task");
                    }
        
                    const previousStartStatus = await getDoc(doc(db, "taskStatuses", taskDoc.data().status));
                    if (!previousStartStatus.exists) {
                        throw new Error("The task doesn't have a previous task status");
                    }
        
                    await updateDoc(taskDocRef, {
                        status: startStatus,
                        finishedDate: startStatus == endStatus ? new Date().toDateString() : null,
                        updatedAt: serverTimestamp()
                    });
        
                    await createHistory({
                        userId: userId,
                        taskId: item.id,
                        projectId: taskDoc.data().projectId,
                        action: getHistoryAction.update,
                        eventType: getHistoryEventType.taskStatus,
                        previousValue: previousStartStatus.data().statusName,
                        newValue: startStatusDoc.data().statusName
                    });
                });
        
                await Promise.all(updateTasks);
            }
        }        

        if (endStatus != updatedProjectSnap.data().endStatus) {
            const q = query(collection(db, "tasks"), where("status", "==", projectData.endStatus));
            const taskSnapShot = await getDocs(q);
        
            const updateTasks = taskSnapShot.docs.map(async (item) => {
                const taskDocRef = doc(db, "tasks", item.id);
                const taskDoc = await getDoc(taskDocRef);
        
                if (!taskDoc.exists()) {
                    throw new Error("Something went wrong when updating task");
                }
        
                const previousEndStatus = await getDoc(doc(db, "taskStatuses", taskDoc.data().status));
                if (!previousEndStatus.exists) {
                    throw new Error("The task doesn't have a previous task status");
                }
        
                await updateDoc(taskDocRef, {
                    status: endStatus,
                    finishedDate: null,
                    updatedAt: serverTimestamp()
                });
        
                await createHistory({
                    userId: userId,
                    taskId: item.id,
                    projectId: taskDoc.data().projectId,
                    action: getHistoryAction.update,
                    eventType: getHistoryEventType.taskStatus,
                    previousValue: previousEndStatus.data().statusName,
                    newValue: endStatusDoc.data().statusName
                });
            });
        
            await Promise.all(updateTasks);
        }        

        return NextResponse.json({
            data: {
                id: updatedProjectSnap.id,
                ...updatedProjectSnap.data()
            },
            message: "Successfully updated the project"
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
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
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }
        
        const { projectId } = response.params;
        const projectDocRef = doc(db, 'projects', projectId);
        const projectDocSnap = await getDoc(projectDocRef)

        if (!projectDocSnap.exists()) {
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 })
        }

        const projectName = projectDocSnap.data().projectName

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        await deleteDoc(projectDocRef);

        await createHistory({
            userId: userId,
            projectId: projectId,
            eventType: getHistoryEventType.project,
            action: getHistoryAction.delete,
            deletedValue: projectName
        })

        return NextResponse.json({
            message: "Project successfully deleted"
        }, { status: 200 });

    } catch (error) {
        console.error("Can't delete project", error);        
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}