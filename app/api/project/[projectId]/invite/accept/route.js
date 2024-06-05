import { db } from "@/app/firebase/config";
import { createHistory } from "@/app/firebase/util";
import { nextAuthOptions } from "@/app/lib/auth";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";
import { getUserSession } from "@/app/lib/session";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                success: false,
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                success: false,
                message: "User not found" 
            }, { status: 404 });
        }

        const { projectId } = response.params 

        if(!projectId){
            return NextResponse.json({
                success: false,
                message: "Missing parameter"
            }, { status: 400 })
        }

        const projectData = await getDoc(doc(db, "projects", projectId))
        if(!projectData.exists()) {
            return NextResponse.json({
                success: false,
                message: "Project doesn't exists"
            }, { status: 404 })
        }

        if(projectData.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const teamsRef = collection(db, 'teams')

        const q = query(teamsRef, 
            where('userId', '==', userId),
            where('projectId', '==', projectId)
        )

        const querySnapshot = await getDocs(q);

        const team = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))

        const teamDocRef = doc(db, 'teams', team[0].id);

        await updateDoc(teamDocRef, {
            status: "accepted",
            updatedAt: new Date().toISOString()
        });

        await createHistory({
            userId: userId,
            projectId: projectId,
            action: getHistoryAction.update,
            eventType: getHistoryEventType.invitation
        })

        return NextResponse.json({
            success: true,
            message: "Successfully accept invitation of new member to team"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}