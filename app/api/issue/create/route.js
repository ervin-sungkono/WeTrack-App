import { db } from "@/app/firebase/config";
import { NextResponse } from 'next/server'
import { doc, addDoc, collection } from "firebase/firestore";

export async function POST(request) {
    try {
        const { 
            projectId, 
            assignedTo, 
            issueTypeId, 
            issueName, 
            createdBy, 
            label, 
            issueStatusId, 
            description, 
            startDate, 
            dueDate,
            finishedDate 
        } = await request.json();

        const docRef = await addDoc(collection(db, 'issues'), {
            projectId: projectId,
            assignedTo: assignedTo,
            issueTypeId: issueTypeId,
            issueName: issueName,
            createdBy: createdBy,
            label: label,
            issueStatusId: issueStatusId,
            description: description,
            startDate: startDate,
            dueDate: dueDate? dueDate: null,
            finishedDate: finishedDate? finishedDate: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null
        });

    } catch (error) {
        console.error("Can't create issue", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}