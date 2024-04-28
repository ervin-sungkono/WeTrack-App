import { db } from "@/app/firebase/config";
import { deleteDoc, getDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(request, context) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { id } = context.params;
       
        const commentDocRef = doc(db, 'comments', id);
        const commentSnap = await getDoc(commentDocRef)

        if (!commentSnap.exists()) {
            return NextResponse.json({
                message: "Comment not found"
            }, { status: 404 })
        }

        if(commentSnap.data().userId === userId){
            await deleteDoc(commentDocRef)
            return NextResponse.json({
                message: "Task successfully deleted"
            }, { status: 200 });
        }
        else{
            return NextResponse.json({
                message: "Unable to delete comment, unauthorized user"
            }, { status: 401 });
        }
    } catch (error) {
        console.error("Can't delete comment", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}