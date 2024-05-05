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

        const directProjectsRef = collection(db, 'projects');
        const directQuery = query(directProjectsRef, where('createdBy', "==", userId));
        const directProjectSnapshots = await getDocs(directQuery);

        console.log("direct projek docs", directProjectSnapshots)

        const teamsRef = collection(db, 'team');    
        const teamQuery = query(teamsRef, where('userId', "==", userId), where('status', "==", 'accepted'));
        const teamSnapshots = await getDocs(teamQuery);

        console.log("team docs", teamSnapshots)

        const teamProjectIds = teamSnapshots.docs.map(doc => doc.data().projectId);
        const projectFetches = teamProjectIds.map(projectId => getDoc(doc(db, 'projects', projectId)));
        const teamProjects = await Promise.all(projectFetches);

        console.log("team projek", teamProjects)

        const combinedProjectDocs = [...directProjectSnapshots.docs, ...teamProjects.filter(doc => doc.exists())];

        console.log("combine projek docs", combinedProjectDocs)

        const projects = await Promise.all(combinedProjectDocs.map(async (item) => {
            const projectData = item.data();
            const userDoc = await getDoc(doc(db, 'users', projectData.createdBy));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
                id: item.id,
                ...projectData,
                createdBy: userData ? {
                    id: userDoc.id,
                    fullName: userData.fullName,
                    profileImage: userData.profileImage
                } : null
            };
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

            if (statuses[i] === 'To Do') {
                startStatusId = statusDocRef.id;
            } else if (statuses[i] === 'Done') {
                endStatusId = statusDocRef.id;
            }
        }

        console.log("startStatusId", startStatusId)
        console.log("endStatusId", endStatusId)

        const startStatusDocRef = await getDoc(doc(db, "taskStatuses", startStatusId))
        const startStatusDetail = {
            id: startStatusDocRef.id,
            status: startStatusDocRef.data().statusName
        }
        
        const endStatusDocRef = await getDoc(doc(db, "taskStatuses", endStatusId))
        const endStatusDetail = {
            id: endStatusDocRef.id,
            status: endStatusDocRef.data().statusName
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
            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data(),
                    createdBy: createdByDetail,
                    startStatus: startStatusDetail,
                    endStatus: endStatusDetail
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