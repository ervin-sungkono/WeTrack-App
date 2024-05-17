import { db } from "@/app/firebase/config";
import { addDoc, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { nextAuthOptions } from "@/app/lib/auth";
import { extractUniqueMentionTags } from "@/app/lib/string";
import { getUserSession } from "@/app/lib/session";
import { getProjectRole } from "@/app/firebase/util";
import { createHistory, createNotification } from "@/app/firebase/util";

export async function GET(request, response){
    try{
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized, user id not found"
            }, { status: 401 })
        }

        const { taskId } = response.params

        if(!taskId) {
            return NextResponse.json({
                message: "Missing paramater"
            }, { status: 404 })
        }

        const commentsColRef = collection(db, 'comments')
        const q = query(commentsColRef, where('taskId', '==', taskId))
        const querySnapshot = await getDocs(q)

        const comments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
        }))

        return NextResponse.json({
            data: comments, 
            message: "Succesfully get all available comments"
        }, { status: 200 })
    }catch(error){
        console.error("Cannot get comments", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request, response){
    try {
        const session = await getUserSession(request, response, nextAuthOptions)
        const userId = session.user.uid

        if(!userId){
            return NextResponse.json({
                message: "You are not authorized"
            }, { status: 401 })
        }

        const { taskId } = response.params

        const taskDocRef = doc(db, "tasks", taskId)
        const taskSnap = await getDoc(taskDocRef)

        if(!taskSnap.exists()){
            return NextResponse.json({
                message: "Task id is invalid or not found"
            }, { status: 404 })
        }

        const projectRole = await getProjectRole({ projectId: taskSnap.data().projectId, userId})
        if(projectRole !== 'Owner' && projectRole !== 'Member'){
            return NextResponse.json({
                message: "Unauthorized",
                success: false
            }, { status: 401 })
        }

        const {  commentText} = await request.json()

        if(!commentText){
            return NextResponse.json({
                message: "Missing parameter"
            }, { status: 400 })
        }

        const newComment = await addDoc(collection(db, 'comments'), {
            projectId: taskSnap.data().projectId,
            taskId: taskId,
            userId: userId,
            commentText: commentText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null
        });

        if(!newComment){
            return NextResponse.json({
                message: "Fail to create new comment"
            }, { status: 500 })
        }

        const newCommentSnap = await getDoc(newComment)

        if(newCommentSnap.exists()){
            await createHistory({
                userId: userId,
                taskId: taskId,
                projectId: taskSnap.data().projectId,
                eventType: 'Comment',
                action: 'create'
            })

            // Pastikan pembuat komen bukan pembuat tugas
            if(taskSnap.data().createdBy !== userId){
                await createNotification({
                    userId: taskSnap.data().createdBy,
                    senderId: userId,
                    taskId: taskId,
                    projectId: taskSnap.data().projectId,
                    type: 'AddedComment'
                })
            }

            const mentions = extractUniqueMentionTags(commentText)
            await Promise.all(mentions.map(mention => (
                createNotification({ 
                    userId: mention.id,
                    senderId: userId,
                    taskId: taskId,
                    projectId: taskSnap.data().projectId,
                    type: 'Mention'
                })
            )))
        }

        return NextResponse.json({
            data: {
                id: newComment.id,
                ...newCommentSnap.data()
            },
            message: "Successfully create new comment"
        }, {  status: 200 })

    } catch (error) {
        console.error("Cannot add comment", error);
        return NextResponse.json({
            data: null,
            message: error.message
        }, { status: 500 });
    }
}