import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { deleteExistingFile } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { getProjectRole } from "@/app/firebase/util";
import { NextResponse } from "next/server";

export async function DELETE(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { attachmentId } = response.params

        if(!attachmentId){
            return NextResponse.json({
                message: "Missing params"
            }, { status: 400 })
        }

        const attachmentDocRef = doc(db, 'attachments', attachmentId);
        const attachmentDoc = await getDoc(attachmentDocRef);

        if(!attachmentDoc.exists()) {
            return NextResponse.json({
                success: false,
                message: "Attachment doesn't exists"
            }, { status: 400 })
        }
        const attachmentData = attachmentDoc.data();

        const projectRole = await getProjectRole({ projectId: attachmentData.projectId, userId})
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        if (attachmentData && attachmentData.attachmentStoragePath) {
            await deleteExistingFile(attachmentData.attachmentStoragePath);

            await deleteDoc(attachmentDocRef)

            return NextResponse.json({
                success: true,
                message: "Attachment deleted successfully"
            }, { status: 200 });

        } else {
            return NextResponse.json({
                success: false,
                message: "No Attachment found to delete"
            }, { status: 404 });
        }

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}