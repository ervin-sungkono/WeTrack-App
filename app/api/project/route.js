import { addDoc, collection, updateDoc, serverTimestamp, getDoc, query, where, getDocs, doc, FieldPath } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { sendMail } from '@/app/lib/mail';

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

        const projectsRef = collection(db, 'projects')
        const fieldRef = new FieldPath('createdBy', 'id')

        const q = query(projectsRef, where(fieldRef, "==", userId));
        const querySnapshot = await getDocs(q);

        const projects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            data: projects,
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
        const { key, projectName, teams } = await request.json();
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
        const { fullName, profileImage } = user.data()

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
        let taskStatusList = []; 

        for (let i = 0; i < statuses.length; i++){
            const statusDocRef = await addDoc(collection(db, 'taskStatuses'), {
                statusName: statuses[i],
                projectId: docRef.id,
                order: i+1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null
            });

            if (statuses[i] === 'To Do') {
                startStatusId = statusDocRef.id;
            } else if (statuses[i] === 'Done') {
                endStatusId = statusDocRef.id;
            }
        }

        // for (const status of statuses) {
        //     const statusDocRef = await addDoc(collection(db, 'taskStatuses'), {
        //         statusName: status,
        //         projectId: docRef.id,
        //         order: ,
        //         createdAt: serverTimestamp(),
        //         updatedAt: serverTimestamp(),
        //         deletedAt: null
        //     });

        //     if (status === 'To Do') {
        //         startStatusId = statusDocRef.id;
        //     } else if (status === 'Done') {
        //         endStatusId = statusDocRef.id;
        //     }
        // }

        const usersRef = collection(db, 'users')
        
        let teamList = []
        if(teams){
            teamList = await Promise.all(teams.map(async(email) => {
                const userDocRef = query(usersRef, where('email', '==', email))
                const userSnap = await getDocs(userDocRef)
                const userData = userSnap.docs?.[0]
                if(userData){
                    const { email, fullName, profileImage } = userData.data()
                    return {
                        id: userData.id,
                        email,
                        fullName,
                        profileImage,
                        status: "pending" // status = pending OR accepted
                    }
                }
                return null
            })).then(arr => arr.filter(user => user != null))
    
            await Promise.all(teamList.map(({ email, fullName }) => {
                return sendMail({
                    email,
                    fullName,
                    projectId: docRef.id,
                    projectName
                })
            }))
        }

        const startStatusDetail = await getDoc(doc(db, "taskStatuses", startStatusId))
        const { startStatus } = startStatusDetail.data()

        const endStatusDetail = await getDoc(doc(db, "taskStatuses", endStatusId))
        const { endStatus } = endStatusDetail.data()
        
        await updateDoc(docRef, {
            startStatus: { 
                id: startStatusId, 
                status: startStatus
            },
            endStatus: { 
                id: endStatusId,
                status: endStatus
            },
            taskStatusList: taskStatusList,
            team: teamList,
            updatedAt: serverTimestamp()
        });

        const updatedProjectSnap = await getDoc(docRef);

        if (updatedProjectSnap.exists()) {
            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data()
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
