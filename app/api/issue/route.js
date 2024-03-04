import { updateDoc, doc, getDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { v4 as uuidv4 } from "uuid";

export async function GET(request) {
    try {
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectsRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectsRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }

        const issueData = projectSnap.data()
        console.log("issue data:", issueData)
        const issueList = issueData.issueList
        console.log("issue list:", issueList)

        if (!issueList) {
            return NextResponse.json({
                data: null,
                message: "There are no issue available"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: issueList,
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
        const { 
            projectId, 
            assignedTo,
            typeId,
            createdBy,
            issueName,
            label,
            statusId,
            description,
            startDate,
            dueDate

        } = await request.json();
        
        if (!projectId ||!typeId ||!createdBy ||!issueName ||!statusId) {
            return NextResponse.json({
                data: null,
                message: "Missing mandatory fields"
            }, { status: 500 });
        }
        
        const projectDocRef = doc(db, 'projects', projectId);

        const newIssue = {
            id: uuidv4(),
            projectId: projectId, 
            assignedTo: assignedTo? assignedTo : null,
            typeId: typeId? typeId : null,
            createdBy: createdBy,
            issueName: issueName,
            label: label? label : null,
            statusId: statusId? statusId : null,
            description: description? description : null,
            startDate: startDate? startDate : null,
            dueDate: dueDate? dueDate : null,
            finishedDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        };

        await updateDoc(projectDocRef, {
            issueList: arrayUnion(newIssue)
        });

        const updatedProjectSnap = await getDoc(projectDocRef);
        
        if (updatedProjectSnap.exists()) {
            return NextResponse.json({
                data: {
                    id: updatedProjectSnap.id,
                    ...updatedProjectSnap.data()
                },
                message: "Successfully added new issue to project"
            }, { status: 200 });

        } else {
            throw new Error("Project document does not exist");
        }

    } catch (error) {
        console.error("Can't create project and issue statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
