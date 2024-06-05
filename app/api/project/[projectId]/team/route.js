import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { sendMail } from "@/app/lib/mail";
import { getUserSession } from "@/app/lib/session";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where, and } from "firebase/firestore";
import { createHistory, createNotification, getProjectRole } from "@/app/firebase/util";
import { NextResponse } from "next/server";
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history";

export async function GET(request, response){
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

        const excludeViewer = request.nextUrl.searchParams.get("excludeViewer")

        const teamCollection = collection(db, 'teams')
        const q = excludeViewer ? 
            query(teamCollection, and(where("projectId", '==', projectId), where("role", '!=', 'Viewer'))) :
            query(teamCollection, where("projectId", '==', projectId))
        const teamSnapshots = await getDocs(q)

        const teams = await Promise.all(teamSnapshots.docs.map(async (item) => {
            const teamData = item.data()
            const userDocRef = await getDoc(doc(db, "users", teamData.userId))
            const userData = userDocRef.exists() ? userDocRef.data() : null

            return {
                id: item.id,
                ...teamData,
                user: {
                    id: userDocRef.id,
                    fullName: userData.fullName,
                    profileImage: userData.profileImage
                }
            }
        }))

        return NextResponse.json({
            data: teams,
            message: "Successfully get all team members"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response){
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

        const { teams, role = "Member" } = await request.json()
        const { projectId } = response.params
        
        if(!teams){
            return NextResponse.json({
                message: "Payload is not complete",
                success: false
            }, { status: 400 })
        }

        if(!projectId){
            return NextResponse.json({
                message: "Missing parameter",
                success: false
            }, { status: 400 })
        }

        const usersRef = collection(db, 'users')
        const docRef = await getDoc(doc(db, 'projects', projectId))

        if(!docRef.exists()){
            return NextResponse.json({
                message: "Project not found",
                success: false
            }, { status: 404 })
        }

        if(docRef.data().deletedAt != null) {
            return NextResponse.json({
                success: false,
                message: "Project no longer exists"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId, userId})
        if(projectRole !== 'Owner'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const { projectName } = docRef.data()
        
        let teamList = []
        if(teams){
            teamList = await Promise.all(teams.map(async(email) => {
                const userDocRef = query(usersRef, and(where('email', '==', email), where('deletedAt', "!=", null)))
                const userSnap = await getDocs(userDocRef)
                const userData = userSnap.docs?.[0]
                if(userData){
                    const { email } = userData.data()
                    return {
                        id: userData.id,
                        email,
                    }
                }
                return null

            })).then(arr => arr.filter(user => user != null))

            const teamDocList = await Promise.all(teamList.map(async (team) => {
                const invitedUser = await getDoc(doc, "users", team.id)

                await createHistory({
                    userId: userId,
                    projectId: projectId,
                    action: getHistoryAction.create,
                    eventType: getHistoryEventType.invitation,
                    newValue: invitedUser.exists() && {
                        id: invitedUser.id,
                        fullName: invitedUser.data().fullName,
                        profileImage: invitedUser.data().profileImage
                    }
                })

                return await addDoc(collection(db, "teams"), {
                    userId: team.id,
                    email: team.email,
                    projectId: projectId,
                    role: role, 
                    status: "pending",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    deletedAt: null
                })
            }))
    
            const senderName = session.user.fullName;
            teamDocList.forEach(async(docRef) => {
                const doc = await getDoc(docRef)
                const { email } = teamList.find(team => team.id === doc.data().userId)
                
                await sendMail({
                    email,
                    senderName: senderName,
                    teamId: doc.id,
                    projectId: projectId,
                    projectName
                })

                await createNotification({
                    userId: doc.data().userId,
                    senderId: userId,
                    projectId: projectId,
                    type: "ReceiveInvitation"
                })
            })
        }

        return NextResponse.json({
            message: "Successfully sent the invitation",
            success: true
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}