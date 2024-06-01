import { db } from "@/app/firebase/config";
import { createHistory, createNotification } from "@/app/firebase/util";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { doc, getDoc, updateDoc, writeBatch, getDocs, query, where, collection } from "firebase/firestore";
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

        const { projectId, teamId } = response.params

        const projectDocRef = doc(db, 'projects', projectId)
        const projectDocSnap = await getDoc(projectDocRef)
        if(!projectDocSnap.exists()){
            return NextResponse.json({ 
                message: "Project data not found",
                success: false 
            }, { status: 404 });
        }
        if(projectDocSnap.data().deletedAt != null){
            return NextResponse.json({ 
                message: "Project has been deleted",
                success: false 
            }, { status: 404 });
        }

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

        if(teamDocSnap.data().status === "accepted"){
            return NextResponse.json({
                message: "You have already accepted the invitation",
                success: false 
            }, { status: 401 })
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
            if(updatedTeamData.role === "Viewer"){
                const batch = writeBatch(db)

                const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', updatedTeamData.userId))
                const tasksWithAssignedUser = await getDocs(tasksQuery)

                tasksWithAssignedUser.docs.forEach(async(taskDoc) => {
                    batch.update(taskDoc.ref, {
                        assignedTo: null
                    })
                    const oldAssignedToValue = taskDoc.data().assignedTo == null ? null : await getDoc(doc(db, "users", taskDoc.data().assignedTo))
                    await createHistory({
                        userId: userId,
                        taskId: taskDoc.id,
                        projectId: taskData.projectId,
                        action: getHistoryAction.update,
                        eventType: getHistoryEventType.assignedTo,
                        previousValue: taskDoc.data().assignedTo == null ? null : {...oldAssignedToValue.data()},
                        newValue: null
                    })
                })

                await batch.commit()
            }
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

        const batch = writeBatch(db)

        const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', teamDoc.data().userId))
        const tasksWithAssignedUser = await getDocs(tasksQuery)

        tasksWithAssignedUser.docs.forEach(async(taskDoc) => {
            batch.update(taskDoc.ref, {
                assignedTo: null
            })
            const oldAssignedToValue = taskDoc.data().assignedTo == null ? null : await getDoc(doc(db, "users", taskDoc.data().assignedTo))
            await createHistory({
                userId: userId,
                taskId: taskDoc.id,
                projectId: taskData.projectId,
                action: getHistoryAction.update,
                eventType: getHistoryEventType.assignedTo,
                previousValue: taskDoc.data().assignedTo == null ? null : {...oldAssignedToValue.data()},
                newValue: null
            })
        })

        const teamRef = doc(db, "teams", teamId)
        batch.delete(teamRef)

        await batch.commit()

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