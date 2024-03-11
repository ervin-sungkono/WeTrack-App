import { db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const issueTypesColRef = collection(db, 'issueTypes')
        const issueTypesDocsRef = await getDocs(issueTypesColRef)

        if(!issueTypesDocsRef) {
            return NextResponse.json({
                message: "Can't get issue type docs"
            }, { status: 404 })
        }

        let issueTypes = [];

        issueTypesDocsRef.forEach((doc) => {
            issueTypes.push({
                id: doc.id,
                issueType: doc.data().issueType
            })
            return issueTypes
        })

        return NextResponse.json({
            data: issueTypes, 
            message: "Succesfully get all available issue types"
        }, { status: 200 })

    } catch (error) {
        console.error("Cannot get issue types", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}