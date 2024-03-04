import { updateDoc, serverTimestamp, getDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function GET(request, context) {
    try {
        const { id } = context.params
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectRef = doc(db, "projects", projectId)

        if(!projectRef) {
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 });
        }

        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data()

        if(!projectData) {
            return  NextResponse.json({
                message: "Project detail not found"
            }, { status: 404 });
        }

        console.log("issue list", projectData.issueList)
        const issueDetail = projectData.issueList.find((issue) => issue.id === id )

        console.log("issue detail", issueDetail)

        if(!issueDetail) {
            return NextResponse.json({
                message: "No issue found"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: issueDetail,
            message: "Successfully get Issue detail"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id }  = context.params;
        const { 
            projectId, 
            assignedTo,
            typeId,
            issueName,
            label,
            statusId,
            description,
            startDate,
            dueDate

        } = await request.json();

        const projectDocRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);

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
            assignedTo: assignedTo ?? projectData.assignedTo,
            typeId: typeId ?? projectData.typeId,
            issueName: issueName ?? projectData.issueName,
            label: label ?? projectData.label,
            statusId: statusId ?? projectData.statusId,
            description: description ?? projectData.description,
            startDate: startDate ?? projectData.startDate,
            dueDate: dueDate ?? projectData.dueDate,
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

export async function DELETE(request, context) {
    try {
        const { id } = context.params;
        const projectId = request.nextUrl.searchParams.get("projectId")

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