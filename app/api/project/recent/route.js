import { collection, query, where, getDocs, getDoc, doc, and, limit } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';
import { sortDateFn } from '@/app/lib/helper';

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 400 })
        }

        const teamsRef = collection(db, 'teams');    
        const teamQuery = query(teamsRef, and(where('userId', "==", userId), where('status', '==', 'accepted'), where('deletedAt', '==', null)), limit(3));
        const teamSnapshots = await getDocs(teamQuery);
        const projectIds = teamSnapshots.docs.map(project => project.data().projectId)

        const allProjects = await Promise.all(projectIds.map(async (item) => {
            const projectDoc = await getDoc(doc(db, "projects", item))
            if(projectDoc.exists()) {
                return {
                    id: projectDoc.id,
                    ...projectDoc.data()
                }
            }
            return null
        }))

        return NextResponse.json({
            data: sortDateFn({ data: allProjects, sortDirection: 'desc', key: 'createdAt' }),
            message: "Projects retrieved successfully"
        }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}