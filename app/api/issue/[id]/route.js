import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function PUT(request, { params }) {
    try {
        const { id }  = params;
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

        const projectDocRef = doc(db, 'projects', projectId);
        console.log("projectDocRef", projectDocRef)
        const projectSnap = await getDoc(projectDocRef);
        console.log("project snap", projectSnap)

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "No such project found"
            }, { status: 404 });
        }

        const projectData = projectSnap.data();
        const issueList = projectData.issueList || [];
        const issueIndex = issueList.findIndex(issue => issue.id === id);

        if (issueIndex === -1) {
            return NextResponse.json({ 
                message: 'Issue not found' 
            }, { status: 404 });
        }

        const issueToUpdate = issueList[issueIndex];
        const updatedIssue = {
            ...issueToUpdate,
            assignedTo,
            typeId,
            createdBy,
            issueName,
            label,
            statusId,
            description,
            startDate,
            dueDate,
            updatedAt: new Date().toISOString(),
        };

        const updatedIssueList = [
            ...issueList.slice(0, issueIndex),
            updatedIssue,
            ...issueList.slice(issueIndex + 1),
        ];

        await updateDoc(projectDocRef, {
            issueList: updatedIssueList,
        });

        return NextResponse.json({
            message: 'Issue updated successfully' 
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const { projectId } = request.nextUrl.searchParams.get("projectid")

        const projectDocRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({
                data: null,
                message: "Project not found"
            }, { status: 404 });
        }

        const projectData = projectSnap.data();
        let issueList = projectData.issueList || [];
        const issueIndex = issueList.findIndex(issue => issue.id === id);

        if (issueIndex === -1) {
            return NextResponse.json({
                data: null,
                message: 'Issue not found'
            }, { status: 404 });
        }

        issueList.splice(issueIndex, 1);

        await updateDoc(projectDocRef, {
            issueList: issueList
        });

        return NextResponse.json({
            message: "Issue successfully deleted"
        }, { status: 200 });
        

    } catch (error) {
        console.error("Can't delete project", error);        
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}