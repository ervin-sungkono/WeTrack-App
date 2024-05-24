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
        if(team[0].status == "pending"){
            await deleteDoc(teamDocRef)
    
            return NextResponse.json({
                success: true,
                message: "Successfully reject new member invitation to team"
            }, { status: 200 });
        }

        return NextResponse.json({
            success: false,
            message: "You already join the team"
        }, { status: 400 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}