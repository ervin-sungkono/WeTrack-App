import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function PUT(request, { params }) {
    try {
        const { id }  = params;
        const { key, projectName } = await request.json();

        const projectDocRef = doc(db, 'projects', id);

        console.log(projectDocRef)

        await updateDoc(projectDocRef, {
            key: key,
            projectName: projectName,
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

export async function DELETE({ params }) {
    try {
        const { id } = params;
        const projectDocRef = doc(db, 'projects', id);

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