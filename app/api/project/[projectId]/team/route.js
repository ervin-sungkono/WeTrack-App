import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { sendMail } from "@/app/lib/mail";
import { getUserSession } from "@/app/lib/session";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

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

        const teamCollection = collection(db, 'teams')
        const q = query(teamCollection, where("projectId", '==', projectId))
        const teamSnapshots = await getDocs(q)

        // if(teamSnapshots.empty()){
        //     return NextResponse.json({
        //         message: "There are no personel yet in this project"
        //     }, { status: 404 })
        // }

        const teams = await Promise.all(teamSnapshots.docs.map(async (item) => {
            const teamData = item.data()
            const userDocRef = await getDoc(doc(db, "users", teamData.userId))
            const userData = userDocRef.exists ? userDocRef.data() : null

            return {
                id: item.id,
                ...teamData,
                user: {
                    id: userData.id,
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
                message: "Unauthorized, must login first" 
            }, { status: 401 });
        }

        const userId = session.user.uid;
        if (!userId) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 404 });
        }

        const { teams } = await request.json()
        const { projectId } = response.params
        
        console.log("teams", teams)
        console.log("projectId", projectId)
        if(!teams){
            return NextResponse.json({
                message: "Payload is not complete"
            }, { status: 400 })
        }

        if(!projectId){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const usersRef = collection(db, 'users')
        const docRef = await getDoc(doc(db, 'projects', projectId))
        const { projectName } = docRef.data()

        if(!docRef.exists()){
            return NextResponse.json({
                message: "Project not found"
            }, { status: 404 })
        }
        
        let teamList = []
        if(teams){
            teamList = await Promise.all(teams.map(async(email) => {
                const userDocRef = query(usersRef, where('email', '==', email))
                const userSnap = await getDocs(userDocRef)
                const userData = userSnap.docs?.[0]
                if(userData){
                    const { email, fullName, profileImage } = userData.data()
                    return {
                        id: userData.id,
                        email,
                        fullName,
                        profileImage,
                        status: "pending" // status = pending OR accepted
                    }
                }
                return null

            })).then(arr => arr.filter(user => user != null))
    
            await Promise.all(teamList.map(({ email, fullName }) => {
                return sendMail({
                    email,
                    fullName,
                    projectId: docRef.id,
                    projectName
                })
            }))
        }

        return NextResponse.json({
            message: "Successfully sent the invitation"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}