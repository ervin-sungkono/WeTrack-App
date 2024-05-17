import { db } from "@/app/firebase/config";
import { getProjectRole } from "@/app/firebase/util";
import { nextAuthOptions } from "@/app/lib/auth";
import { uploadSingleFile } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { collection, getDoc, getDocs, doc, query, serverTimestamp, where, runTransaction } from "firebase/firestore";
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
        const attachment = formData.get('attachment')

        if(!attachment){
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

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const imageSizeLimit = 2 * 1024 * 1024

        if (attachment.size > imageSizeLimit) {
            return NextResponse.json({
                message: "Sorry, the attachment exceeded the limit of 2mb"
            }, { status: 400 })
        }

        const result = await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, "attachmentCounters", taskId)
            const counterSnap = await transaction.get(counterRef)
            const attachmentCount = counterSnap.exists() ? counterSnap.data().count : 0 

            if (attachmentCount >= 10) {
                throw new Error("The task already has 10 attachments");
            }
        
            const result = await uploadSingleFile(attachment, `/project/${projectId}/tasks/${taskId}/${attachment.name}`);
            const attachmentDocRef = doc(collection(db, "attachments"))
            transaction.set((attachmentDocRef), {
                projectId: projectId,
                taskId: taskId,
                originalFileName: attachment.name,
                attachmentStoragePath: result,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deletedAt: null
            })

            if(!counterSnap.exists()) {
                transaction.set(counterRef, {
                    count: 1,
                    updatedAt: serverTimestamp()
                })
            } else {
                transaction.set(counterRef, {
                    count: counterSnap.data().count + 1,
                    updatedAt: serverTimestamp()
                })
            }

            return result
        })
           
        return NextResponse.json({
            success: true,
            message: "Files uploaded successfully"
        }, { status: 200 });
            
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
