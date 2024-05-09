import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { deleteExistingFile } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
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
        const attachmentData = attachmentDoc.data();

        if (attachmentData && attachmentData.attachmentStoragePath) {
            await deleteExistingFile(attachmentData.attachmentStoragePath);

            await deleteDoc(attachmentDocRef)

            return NextResponse.json({
                message: "Attachment deleted successfully"
            }, { status: 200 });

        } else {
            return NextResponse.json({
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