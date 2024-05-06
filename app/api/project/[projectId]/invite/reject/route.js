import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
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

        console.log("team", team)
        console.log("----", team[0])

        const teamDocRef = doc(db, 'teams', team[0].id);
        if(team[0].status == "pending"){
            await deleteDoc(teamDocRef)
    
            return NextResponse.json({
                data: team,
                message: "Successfully reject new member invitation to team"
            }, { status: 200 });
        }

        return NextResponse.json({
            message: "You already join the team"
        }, { status: 400 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}