import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc, query, where, getDocs, collection } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory, deleteTasks, deleteTaskStatuses } from '@/app/firebase/util';
import { getProjectRole } from '@/app/firebase/util';
import { getHistoryAction, getHistoryEventType } from '@/app/lib/history';
import { deleteProject } from '@/app/firebase/util';

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

        if(projectData.deletedAt != null) {
            return NextResponse.json({
                message: "Project is no longer exists"
            }, { status: 404 })
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

        if(projectData.deletedAt != null) {
            return NextResponse.json({
                message: "Project is no longer exists"
            }, { status: 404})
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

        if(projectData.endStatus !== updatedProjectSnap.data().endStatus) {
            const q = query(collection(db, "tasks"), where("status", "==", projectData.endStatus));
            const currentTaskSnapShotInEndStatus = await getDocs(q);
        
            await Promise.all(currentTaskSnapShotInEndStatus.docs.map(async (taskDoc) => {
                if(!taskDoc.exists()) return
                
                await updateDoc(taskDoc.ref, {
                    finishedDate: null, 
                    updatedAt: serverTimestamp()
                });

                await createHistory({
                    userId: userId,
                    taskId: taskDoc.id,
                    projectId: projectId,
                    action: getHistoryAction.update,
                    eventType: getHistoryEventType.task
                });
        
            }));

            const q1 = query(collection(db, "tasks"), where("status", "==", updatedProjectSnap.data().endStatus));
            const currentTaskSnapShotInCurrentEndStatus = await getDocs(q1);

            await Promise.all(currentTaskSnapShotInCurrentEndStatus.docs.map(async (taskDoc) => {
                if(!taskDoc.exists()) return
                
                await updateDoc(taskDoc.ref, {
                    finishedDate: new Date().toISOString(), 
                    updatedAt: serverTimestamp()
                });

                await createHistory({
                    userId: userId,
                    taskId: taskDoc.id,
                    projectId: projectId,
                    action: getHistoryAction.update,
                    eventType: getHistoryEventType.task
                });
            }));
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

        if(projectDocSnap.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const projectName = projectDocSnap.data().projectName

        // await deleteDoc(projectDocRef);
        await deleteProject({ projectId: projectId })
        
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