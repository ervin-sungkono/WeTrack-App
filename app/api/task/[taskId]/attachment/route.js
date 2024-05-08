import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params

        const q = query(collection(db, "attachments"), where("taskId", "==", taskId))
        const attachmentDocsRef = await getDocs(q)

        if(attachmentDocsRef.empty()){
            return NextResponse.json({
                data: [],
                message: "No attachment yet for this task"
            }, { status: 200 })
        }

        const attachmentDocs = attachmentDocsRef.docs.map(item => ({
                id: item.id,
                ...item.data()
            }
        ))

        return NextResponse.json({
            data: attachmentDocs,
            message: "Successfully get all attachments"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const formData = await request.formData();
        const attachments = formData.get('attachments')

        console.log("attachments", attachments)
        console.log("attachment size", attachments.size)

        
        if(!attachments){
            return NextResponse.json({
                message: "Missing payload"
            }, { status: 404 })
        }
        
        const imageSizePerFile = 2 * 1024 * 1024
        
        for (const attachment of attachments) {
            if (attachment > imageSizePerFile) {
                return NextResponse.json({
                    message: "File exceeded the limit of 2mb per attachment"
                }, { status: 400 })
            }
        }
        
        if(attachments && attachments.length > 0){


        }


    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}