import { updateDoc, getDoc, doc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

export async function GET(request, context) {
    try {
        const { id } = context.params
        const projectId = request.nextUrl.searchParams.get("projectId")

        const projectRef = doc(db, "projects", projectId)

        if (!projectRef) {
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 });
        }

        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data()

        if (!projectData) {
            return NextResponse.json({
                message: "Project detail not found"
            }, { status: 404 });
        }

        console.log("issue list", projectData.issueList)
        const issueDetail = projectData.issueList.find((issue) => issue.id === id)

        console.log("issue detail", issueDetail)

        if (!issueDetail) {
            return NextResponse.json({
                message: "No issue found"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: issueDetail,
            message: "Successfully get Issue detail"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get issues in project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id } = context.params;
        const {
            projectId,
            assignedTo,
            typeId,
            taskName,
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

        const issueToUpdate = issueList[issueIndex];

        if (issueIndex === -1) {
            return NextResponse.json({
                message: 'Issue not found'
            }, { status: 404 });
        }

        let assignedToDetails = null;
        if (assignedTo) {
            const userDocRef = doc(db, 'users', assignedTo);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                assignedToDetails = userSnap.data();

            } else {
                return NextResponse.json({
                    message: "Assigned user not found"
                }, { status: 404 })
            }
        }

        let issueTypeDetails = null;
        if (typeId) {
            const userDocRef = doc(db, 'issueTypes', typeId);
            const issueTypeSnap = await getDoc(userDocRef);
            
            if (issueTypeSnap.exists()) {
                issueTypeDetails = issueTypeSnap.data();

            } else {
                return NextResponse.json({
                    message: "The issue type not found"
                }, { status: 404 })
            }
        }

        let issueStatusDetails = null;
        if (statusId) {
            const userDocRef = doc(db, 'issueStatuses', statusId);

            const issueStatusSnap = await getDoc(userDocRef);
            if (issueStatusSnap.exists()) {
                issueStatusDetails = issueStatusSnap.data();

            } else {
                return NextResponse.json({
                    message: "The issue status not found"
                }, { status: 404 })
            }
        }

        const updatedIssue = {
            ...issueToUpdate,
            assignedTo: { assignedTo, assignedToDetails } ?? issueToUpdate.assignedTo,
            type: { typeId, issueTypeDetails } ?? issueToUpdate.type,
            taskName: taskName ?? issueToUpdate.taskName,
            label: label ?? issueToUpdate.label,
            status: { statusId, issueStatusDetails } ?? issueToUpdate.status,
            description: description ?? issueToUpdate.description,
            startDate: startDate ?? issueToUpdate.startDate,
            dueDate: dueDate ?? issueToUpdate.dueDate,
            updatedAt: new Date().toISOString(),
        };

        const updatedIssueList = [
            ...issueList.slice(0, issueIndex),
            updatedIssue,
            ...issueList.slice(issueIndex + 1),
        ];

        const issueDocRef = doc(db, 'issues', issueToUpdate.id)
        const issueSnap = await getDoc(issueDocRef)
        
        let issueCollectionToUpdate;
        if (issueSnap.exists()) {
            issueCollectionToUpdate = issueSnap.data();
            
        } else {
            return NextResponse.json({
                message: "Can't find the issue collection"
            }, { status: 404 })
        }
        
        //update issue collection
        await updateDoc(issueDocRef, {
            assignedTo: { assignedTo, assignedToDetails } ?? issueCollectionToUpdate.assignedTo,
            type: { typeId, issueTypeDetails } ?? issueCollectionToUpdate.type,
            taskName: taskName ?? issueCollectionToUpdate.taskName,
            label: label ?? issueCollectionToUpdate.label,
            status: { statusId, issueStatusDetails } ?? issueCollectionToUpdate.status,
            description: description ?? issueCollectionToUpdate.description,
            startDate: startDate ?? issueCollectionToUpdate.startDate,
            dueDate: dueDate ?? issueCollectionToUpdate.dueDate,
            updatedAt: new Date().toISOString()
        })
        
        //update issue in project collection
        await updateDoc(projectDocRef, {
            issueList: updatedIssueList,
        });

        return NextResponse.json({
            data: updatedIssue,
            message: 'Issue updated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error("Cannot update issue", error);
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
        console.error("Can't delete issue", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}