import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function GET(request, context) {
    try {
        const { id }  = context.params;

        const projectDocRef = doc(db, 'projects', id);

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
        }, { status: 404 });

    } catch (error) {
        console.error("Cannot get project detail", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id }  = context.params;
        const { key, projectName } = await request.json();

        const projectDocRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectDocRef);
        const projectData = projectSnap.data()

        await updateDoc(projectDocRef, {
            key: key ?? projectData.key,
            projectName: projectName ?? projectData.projectName,
            updatedAt: serverTimestamp()
        });

        const updatedProjectSnap = await getDoc(projectDocRef);

        if (updatedProjectSnap.exists()) {
            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data()
                },
                message: "Successfully updated the project"
            }, { status: 200 });
            
        } else {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }

    } catch (error) {
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { id } = context.params;
        const projectDocRef = doc(db, 'projects', id);

        if (!projectDocRef) {
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 })
        }

        await deleteDoc(projectDocRef);

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