import { collection, query, where, orderBy, limit, getDocs, FieldPath, getDoc } from 'firebase/firestore';
import { NextResponse } from "next/server";
import { db } from '@/app/firebase/config';
import { getUserSession } from '@/app/lib/session';
import { nextAuthOptions } from '@/app/lib/auth';

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

        const projectsRef = collection(db, 'projects')
        // const fieldRef = new FieldPath('createdBy', 'id')

        const q = query(projectsRef, where('createdBy', "==", userId), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);

        const projects = await Promise.all(querySnapshot.docs.map(async (item) => {
            const userDoc = await getDoc(doc(db, "users", item.createdBy))
            const userData = userDoc.exists ? userDoc.data() : null

            return {
                id: item.id,
                ...doc.data(),
                createdBy: userData ? {
                    id: userDoc.id,
                    fullName: userData.data().fullName,
                    profileImage: userData.data().profileImage
                } : null
            }
        }));

        return NextResponse.json({
            data: projects,
            message: "Projects retrieved successfully"
        }, { status: 200 });
        
    } catch (error) {
        console.error("Cannot update project", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}