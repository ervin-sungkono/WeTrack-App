import { db } from "@/app/firebase/config";
import { createNotification } from "@/app/firebase/util";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getProjectRole } from "@/app/firebase/util";
import { NextResponse } from "next/server";

export async function GET(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first",
                success: false 
            }, { status: 401 });
        }

        const userId = session.user.uid;

        if (!userId) {
            return NextResponse.json({ 
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        const { teamId } = response.params

        const teamDocRef = doc(db, 'teams', teamId)
        const teamDocSnap = await getDoc(teamDocRef)

        if(!teamDocSnap.exists()){
            return NextResponse.json({ 
                message: "Team data not found",
                success: false 
            }, { status: 404 });
        }

        const projectData = await getDoc(doc(db, "projects", teamDocSnap.data().projectId))
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

        if(teamDocSnap.data().userId !== userId){
            return NextResponse.json({ 
                message: "Unauthorized to join the team",
                success: false 
            }, { status: 401 });
        }

        return NextResponse.json({
            message: "Team data found",
            success: true
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function PUT(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first" ,
                success: false
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        const { teamId } = response.params

        if(!teamId){
            return NextResponse.json({
                message: "Please check your parameter",
                success: false
            }, { status: 404 })
        }

        const teamDocRef = doc(db, "teams", teamId)
        const teamDoc = await getDoc(teamDocRef)
        if(!teamDoc.exists()){
            return NextResponse.json({
                message: "Team not found",
                success: false
            }, { status: 404 })
        }
        const teamData = teamDoc.data()

        const projectData = await getDoc(doc(db, "projects", teamData.projectId))
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

        const projectRole = await getProjectRole({ projectId: teamData.projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const { role } = await request.json()
        if(!role){
            return NextResponse.json({
                message: "Please check your payload",
                success: false
            }, { status: 404 })
        }

        await updateDoc(teamDocRef, {
            role: role ?? teamData.role,
            updatedAt: new Date().toISOString()
        })

        const updatedTeamDoc = await getDoc(teamDocRef)
       
        if(updatedTeamDoc.exists()){
            const updatedTeamData = updatedTeamDoc.data()
            await createNotification({
                userId: teamData.userId,
                projectId: teamData.projectId,
                type: 'RoleChange',
                newValue: updatedTeamData.role
            })
        }
        
        return NextResponse.json({
            message: "Successfully update the role",
            success: true
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions);
        if (!session.user) {
            return NextResponse.json({ 
                message: "Unauthorized, must login first",
                success: false
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        const { teamId } = response.params

        if(!teamId){
            return NextResponse.json({
                message: "Please check your parameter",
                success: false
            }, { status: 404 })
        }
        const teamDocRef = doc(db, "teams", teamId)
        const teamDoc = await getDoc(teamDocRef)
        if(!teamDoc.exists()){
            return NextResponse.json({
                message: "Team not found",
                success: false
            }, { status: 404 })
        }

        const projectData = await getDoc(doc(db, "projects", teamDoc.data().projectId))
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

        const projectRole = await getProjectRole({ projectId: teamDoc.data().projectId, userId})
        if(projectRole !== 'Owner' && userId !== teamDoc.data().userId){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        if(teamDoc.data().role === 'Owner'){
            return NextResponse.json({
                message: "Cannot delete Owner from the team",
                success: false
            }, { status: 401 })
        }

        await deleteDoc(doc(db, "teams", teamId))

        return NextResponse.json({
            success: true,
            message: "Successfully remove the user from the team"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}