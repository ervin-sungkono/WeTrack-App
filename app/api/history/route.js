import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { and, collection, getDoc, getDocs, query, where, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        console.log(session)
        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user ID not found"
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        console.log(searchParams)
        const taskId = searchParams.get('taskId');

        const historyCollectionRef = collection(db, 'histories');
        let q;

        if (!taskId) {
            q = query(historyCollectionRef, where("userId", "==", userId));
        } else {
            q = query(historyCollectionRef, and(where("taskId", "==", taskId), where("userId", "==", userId)));
        }

        const historyDocs = await getDocs(q);

        const send = await Promise.all(historyDocs.docs.map(async (item) => {
            const userDoc = await getDoc(doc(db, "users", item.data().userId));
            const taskDoc = await getDoc(doc(db, "tasks", item.data().taskId));
            const projectDoc = await getDoc(doc(db, "projects", item.data().projectId));

            const userDetail = {
                id: userDoc.id,
                ...userDoc.data()
            };
            const taskDetail = {
                id: taskDoc.id,
                ...taskDoc.data()
            };
            const projectDetail = {
                id: projectDoc.id,
                ...projectDoc.data()
            };

            return {
                id: item.id,
                user: userDetail,
                task: taskDetail,
                project: projectDetail,
                eventType: item.data().eventType,
                action: item.data().action,
                previousValue: item.data().previousValue,
                newValue: item.data().newValue,
                createdAt: item.data().createdAt
            };
        }));

        return NextResponse.json({
            data: send,
            message: "Successfully retrieved histories"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
