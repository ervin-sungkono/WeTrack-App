import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { uploadMultipleFiles } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { addDoc, collection, getDoc, getDocs, doc, query, serverTimestamp, where } from "firebase/firestore";
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
        const attachments = formData.getAll('attachments')

        if(!attachments){
            return NextResponse.json({
                message: "Missing payload"
            }, { status: 404 })
        }

        const { taskId } = response.params

        if(!taskId) {
            return NextResponse.json({
                message: "Missing parameter or query"
            }, { status: 404 })
        }

        const taskDoc = await getDoc(doc(db, "tasks", taskId))
        if(!taskDoc.exists()) {
            return NextResponse.json({
                message: "Tasks doesn't exists"
            }, { status: 400 })
        }
        const projectId = taskDoc.data().projectId
        
        const imageSizePerFile = 2 * 1024 * 1024
        if(attachments.length > 0) {
            for (const attachment of attachments) {
                if (attachment.size > imageSizePerFile) {
                    return NextResponse.json({
                        message: "Sorry, the attachment exceeded the limit of 2mb per object"
                    }, { status: 400 })
                }
            }
        }

        if(attachments && attachments.length > 0){
            const results = await uploadMultipleFiles(attachments, `/project/${projectId}/tasks/${taskId}`);
            console.log(results)
            if(results.length > 0){
                await Promise.all(results.map(async (item) => {
                    return addDoc(collection(db, "attachments"), {
                        taskId: taskId,
                        originalFileName: item.originalFileName,
                        attachmentStoragePath: item.attachmentStoragePath,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        deletedAt: null
                    })
                }))

                return NextResponse.json({
                    success: true,
                    message: "Files uploaded successfully"
                }, { status: 200 });
            }
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}