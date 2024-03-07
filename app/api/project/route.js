import { addDoc, collection, updateDoc, serverTimestamp, getDoc, query, where, getDocs, doc, FieldPath } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 400 })
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
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { key, projectName, createdBy } = await request.json();

        const user = await getDoc(doc(db, 'users', createdBy))
        const { fullName, profileImage } = user.data()

        const docRef = await addDoc(collection(db, 'projects'), {
            key: key,
            projectName: projectName,
            createdBy: {
                id: user.id,
                fullName,
                profileImage
            },
            startStatus: null,
            endStatus: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null
        });

        const statuses = ['To Do', 'In Progress', 'Done'];
        let startStatusId, endStatusId;
        let issueStatusList = []; 

        for (const status of statuses) {
            const statusDocRef = await addDoc(collection(db, 'issueStatuses'), {
                status: status,
                projectId: docRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null
            });

            issueStatusList.push({ id: statusDocRef.id, status: status });

            if (status === 'To Do') {
                startStatusId = statusDocRef.id;
            } else if (status === 'Done') {
                endStatusId = statusDocRef.id;
            }
        }

        await updateDoc(docRef, {
            startStatus: startStatusId,
            endStatus: endStatusId,
            issueStatusList: issueStatusList,
            updatedAt: serverTimestamp()
        });

        const updatedProjectSnap = await getDoc(docRef);

        if (updatedProjectSnap.exists()) {
            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data()
                },
                message: "Successfully created a new project with issue statuses"
            }, { status: 200 });
            
        } else {
            return NextResponse.json({
                data: null,
                message: "Project was created but now cannot be found"
            }, { status: 404 });
        }

    } catch (error) {
        console.error("Can't create project and issue statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
