import { updateDoc, doc, getDoc, arrayUnion, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';

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
        const issueList = issueData.issueList

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
        console.error("Cannot get issues in the project", error);
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

        if(!projectDocRef){
            return NextResponse.json({
                message: "The referred project is not found"
            }, { status: 404 })
        }

        let assignedToDetails = null;
        if (assignedTo) {
            const userDocRef = doc(db, 'users', assignedTo);

            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                assignedToDetails = userSnap.data();
                console.log("assigned to detail", assignedToDetails)

            } else {
                return NextResponse.json({
                    message: "Assigned user not found"
                }, { status: 404 })
            }
        }

        let createdByDetails = null;
        if (createdBy) {
            const userDocRef = doc(db, 'users', createdBy);

            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                createdByDetails = userSnap.data();

            } else {
                return NextResponse.json({
                    message: "The user creator not found"
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

        const newIssue = {
            projectId: projectId, 
            assignedTo: assignedTo? { userId: assignedTo, assignedToDetails } : null,
            type: typeId? { typeId, issueTypeDetails } : null,
            createdBy: createdBy? { userId: createdBy, createdByDetails } : null,
            issueName: issueName,
            label: label? label : null,
            status: statusId? { statusId, issueStatusDetails } : null,
            description: description ?? null,
            startDate: startDate ?? null,
            dueDate: dueDate ?? null,
            finishedDate: null,
            comments: [],
            attachments: [],
            AIResponse: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        };

        const issuesCollectionRef = collection(db, 'issues');
        const issueDocRef = await addDoc(issuesCollectionRef, newIssue);

        if (!issueDocRef) {
            return NextResponse.json({
                message: 'Failed to create new issue doc'
            }, { status: 404 })
        }

        await updateDoc(projectDocRef, {
            issueList: arrayUnion({
                id: issueDocRef.id,
                issueName: newIssue.issueName,
                assignedTo: newIssue.assignedTo,
                type: newIssue.type,
                status: newIssue.status,
                label: newIssue.label
            })
        });
        
        return NextResponse.json({
            data: {
                id: issueDocRef.id,
                ...newIssue
            },
            message: "Successfully added new issue to project and issue collection"
        }, { status: 200 });

    } catch (error) {
        console.error("Can't create issue", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
