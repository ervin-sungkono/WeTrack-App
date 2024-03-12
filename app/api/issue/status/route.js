import { db } from "@/app/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from 'next/server'

export async function GET(request, context) {
    try {
        const projectId = request.nextUrl.searchParams.get("projectId")

        if(!projectId) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const issueStatusColRef = collection(db, 'issueStatuses')
        const q = query(issueStatusColRef, where('projectId', '==', projectId))
        const querySnapshot = await getDocs(q)

        let issueStatuses = [];
        querySnapshot.forEach(doc => {
            issueStatuses.push({
                id: doc.id,
                issueStatus: doc.data().status
            })
            return issueStatuses
        })
            
        if(!issueStatuses) {
            return NextResponse.json({
                message: "Can't get issue status docs"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: issueStatuses, 
            message: "Succesfully get all available issue statuses"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get issue statuses", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}