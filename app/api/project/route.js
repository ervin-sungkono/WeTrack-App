import { addDoc, collection, updateDoc, serverTimestamp, getDoc, query, where, getDocs, setDoc, doc, and } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { createHistory } from '@/app/firebase/util';
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

        const teamsRef = collection(db, 'teams');    
        const teamQuery = query(teamsRef, and(where('userId', "==", userId), where('status', '==', 'accepted'),where('deletedAt', '==', null)));
        const teamSnapshots = await getDocs(teamQuery);
        const projectIds = teamSnapshots.docs.map(team => ({ 
                                id: team.data().projectId,
                                role: team.data().role
                            }))

        const allProjects = await Promise.all(projectIds.map(async ({ id, role }) => {
            const projectDoc = await getDoc(doc(db, "projects", id))
            if(projectDoc.exists()) {
                const projectData = projectDoc.data()
                const userDoc = await getDoc(doc(db, 'users', projectData.createdBy));

                return {
                    id: projectDoc.id,
                    ...projectData,
                    createdBy: {
                        id: userDoc.id,
                        fullName: userDoc.data().fullName,
                        email: userDoc.data().email,
                        profileImage: userDoc.data().profileImage
                    },
                    projectRole: role
                }
            }

            return null

        }))

        return NextResponse.json({
            data: allProjects,
            message: "Projects retrieved successfully"
        }, { status: 200 });
        
    } catch (error) {
        console.error("Cannot get projects", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response) {
    try {
        const { key, projectName } = await request.json();
        const session = await getUserSession(request, response, nextAuthOptions)
        const createdBy = session.user.uid

        if(!createdBy){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }
        if(!key || !projectName){
            return NextResponse.json({
                data: null,
                message: "Missing mandatory fields"
            }, { status: 400 });
        }

        const user = await getDoc(doc(db, 'users', createdBy))

        const docRef = await addDoc(collection(db, 'projects'), {
            key: key,
            projectName: projectName,
            createdBy: user.id,
            startStatus: null,
            endStatus: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null
        });

        const statuses = ['To Do', 'In Progress', 'Done'];
        let startStatusId, endStatusId;

        for (let i = 0; i < statuses.length; i++){
            const statusDocRef = await addDoc(collection(db, 'taskStatuses'), {
                statusName: statuses[i],
                projectId: docRef.id,
                order: i,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null
            });

            await setDoc(doc(db, 'taskOrderCounters', statusDocRef.id), {
                lastOrder: 0,
                updatedAt: serverTimestamp()
            })

            if (statuses[i] === 'To Do') {
                startStatusId = statusDocRef.id;
            } else if (statuses[i] === 'Done') {
                endStatusId = statusDocRef.id;
            }
        }
        
        await updateDoc(docRef, {
            startStatus: startStatusId, 
            endStatus: endStatusId,
            updatedAt: serverTimestamp()
        });

        const updatedProjectSnap = await getDoc(docRef);
        const createdByDetail = {
            id: user.id,
            fullName: user.data().fullName,
            profileImage: user.data().profileImage
        }

        const team = await addDoc(collection(db, "teams"), {
            projectId: docRef.id,
            userId: user.id,
            role: "Owner",
            status: "accepted",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null
        })

        if(!team){
            return NextResponse.json({
                message: "Failed to add user to team"
            }, { status: 204 })
        }

        if (updatedProjectSnap.exists()) {
            await createHistory({
                userId: createdBy, 
                projectId: docRef.id, 
                eventType: getHistoryEventType.project, 
                action: getHistoryAction.create, 
            })

            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data(),
                    createdBy: createdByDetail,
                },
                message: "Successfully created a new project with task statuses"
            }, { status: 200 });
            
        } else {
            return NextResponse.json({
                data: null,
                message: "Project was created but now cannot be found"
            }, { status: 404 });
        }

    } catch (error) {
        console.error("Can't create project and task statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}