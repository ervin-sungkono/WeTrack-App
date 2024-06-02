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

        const taskId = request.nextUrl.searchParams.get("taskId")

        const historyCollectionRef = collection(db, 'histories');
        let q;

        if (!taskId) {
            q = query(historyCollectionRef, where("userId", "==", userId));
        } else {
            q = query(historyCollectionRef, and(where("taskId", "==", taskId), where("userId", "==", userId)));
        }

        const historyDocs = await getDocs(q);

        const historyData = await Promise.all(historyDocs.docs.map(async (item) => ({
                id: item.id,
                ...item.data()
            })   
        ));

        return NextResponse.json({
            data: historyData,
            message: "Successfully retrieved histories"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}
