import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, doc, FieldPath, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { projectId } = response.params 

        if(!projectId){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const teamsRef = collection(db, 'teams')

        // const fieldRef = new FieldPath('userId')
        // const fieldRef2 = new FieldPath('projectId')

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

        const updatedTeam = await getDoc(teamDocRef)

        return NextResponse.json({
            data: {
                id: updatedTeam.id,
                ...updatedTeam.data()
            },
            message: "Successfully accept invitation of new member to team"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}