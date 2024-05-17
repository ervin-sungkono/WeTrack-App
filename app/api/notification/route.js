import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, getDoc, getDocs, query, where, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        
        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user ID not found"
            }, { status: 401 });
        }

        const notificationColRef = collection(db, 'notifications');
        const q = query(notificationColRef, where('userId', '==', userId))
        const notificationSnapshot = await getDocs(q);

        const notificationsData = await Promise.all(notificationSnapshot.docs.map(async (doc) => {
            const { senderId, taskId, projectId } = doc.data()
            const senderDoc = senderId && await getDoc(doc(db, "users", senderId));
            const taskDoc = taskId && await getDoc(doc(db, "tasks", taskId));
            const projectDoc = projectId && await getDoc(doc(db, "projects", projectId));

            const sender = senderDoc && senderDoc.data()
            const task = taskDoc && taskDoc.data()
            const project = projectDoc && projectDoc.data()


            return {
                id: item.id,
                ...doc.data(),
                sender: sender,
                task: task,
                project: project
            };
        }));

        return NextResponse.json({
            data: notificationsData,
            message: "Successfully retrieved notifications"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
