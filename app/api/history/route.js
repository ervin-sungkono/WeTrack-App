import { db } from "@/app/firebase/config";
import { nextAuthOptions } from "@/app/lib/auth";
import { getUserSession } from "@/app/lib/session";
import { and, collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, response) {
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid
        if(!userId){
            return NextResponse.json({
                data: null,
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params

        if(!taskId) {
            const historyCollectionRef = collection(db, 'histories')
            const q = query(historyCollectionRef, where("userId", "==", userId))
            const historyDocs = await getDocs(q)

            const send = await Promise.all(historyDocs.docs.map(async(item) => {
                const userDoc = await getDoc(doc(db, "users", item.data().userId))
                const taskDoc = await getDoc(doc(db, "tasks", item.data().taskId))
                const projectDoc = await getDoc(doc(db, "projects", item.data().projectId))
                
                const userDetail = {
                    id: userDoc.id,
                    ...userDoc.data()
                }
                const taskDetail = {
                    id: userDoc.id,
                    ...userDoc.data()
                }
                const projectDetail = {
                    id: userDoc.id,
                    ...userDoc.data()
                }

                return {
                    id: item.id,
                    user: userDetail,
                    task: taskDetail,
                    project: projectDetail,
                    eventType: item.data().eventType,
                    action: item.data().action,
                    eventType: item.data().eventType,
                    previousValue: item.data().previousValue,
                    newValue: item.data().newValue,
                    createdAt: item.data().createdAt
                }
            }))

            return NextResponse.json({
                data: historyDocs,
                message: "Succesffuly get histories"
            }, { status: 200 })
        }

        if(taskId) {
            const historyCollectionRef = collection(db, 'histories')
            const q = query(historyCollectionRef, and(where("taskId", "==", taskId), where("userId", "==", userId)))
            const historyDocs = await getDocs(q)

            return NextResponse.json({
                data: historyDocs,
                message: "Succesffuly get histories"
            }, { status: 200 })
        }

    } catch (error) {
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}