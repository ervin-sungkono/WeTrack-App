import { nextAuthOptions } from "@/app/lib/auth";
import { deleteExistingFile } from "@/app/lib/file";
import { getUserSession } from "@/app/lib/session";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({
                message: "Unauthorized, must login first"
            }, { status: 401 });
        }

        const userId = session.user.uid;
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userData && userData.profileImage && userData.profileImage.attachmentStoragePath) {
            await deleteExistingFile(userData.profileImage.attachmentStoragePath);

            await updateDoc(userDocRef, {
                "profileImage": null
            });

            return NextResponse.json({
                message: "Profile image deleted successfully"
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: "No profile image found to delete"
            }, { status: 404 });
        }
    } catch (error) {
        console.error("Error during profile image deletion:", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
