import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, getDoc, getDocs, query, where, doc, orderBy, updateDoc } from "firebase/firestore";
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
        const q = query(notificationColRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
        const notificationSnapshot = await getDocs(q);

        const notificationsData = await Promise.all(notificationSnapshot.docs.map(async (item) => ({
                id: item.id,
                ...item.data()
            })
        ));

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
