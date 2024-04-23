import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response, context) {
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

        const { id } = context.params 

        if(!id){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const teamsRef = collection(db, 'teams')

        const fieldRef = new FieldPath('userId')
        const fieldRef2 = new FieldPath('projectId')

        const q = query(teamsRef, 
            where(fieldRef, '==', userId),
            where(fieldRef2, '==', id)
        )

        const querySnapshot = await getDocs(q);

        if(querySnapshot.empty()){
            return NextResponse.json({
                message: "User not found in the team"
            }, { status: 404 })
        }

        const team = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))

        console.log("team", team)
        console.log("----", team[0])

        const teamDocRef = doc(db, 'teams', team[0].id);
        await deleteDoc(teamDocRef)

        return NextResponse.json({
            data: team,
            message: "Successfully reject new member invitation to team"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}