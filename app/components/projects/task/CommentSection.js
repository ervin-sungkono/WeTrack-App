"use client"
import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import dynamic from "next/dynamic"

import { addComment } from "@/app/lib/fetch/comment"
import { deleteComment } from "@/app/lib/fetch/comment"
import { getQueryReference } from "@/app/firebase/util"
import { onSnapshot } from "firebase/firestore"

const CommentInput  = dynamic(() => import("./comment/CommentInput"))
const CommentCard = dynamic(() => import("./comment/CommentCard"))

export default function CommentSection({ comments, setCommentData, taskId }){
    useEffect(() => {
        const reference = getQueryReference({ collectionName: "comments", field: "taskId", id: taskId })
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const updatedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setCommentData(updatedComments)
        })
        return () => unsubscribe()
    }, [taskId])

    const sendComment = async(comment) => {
        const newComment = await addComment({
            text: comment,
            taskId: taskId
        })
        if(!newComment){ 
            alert("Gagal menambahkan komentar baru")
        }
    }

    const handleDeleteComment = async(deletedComment) => {
        deleteComment({taskId: deletedComment.taskId, commentId: deletedComment.id})
            .then(res => {
                if(!res.ok){
                    console.log("Gagal menghapus komentar")
                }
            })
    }

    if(!comments){
        return(
            <div>Memuat data komentar..</div>
        )
    }
    return(
        <SessionProvider>
            <div className="flex flex-col">
                <CommentInput onSubmit={sendComment}/>
                {comments?.map(comment => (
                    <CommentCard key={comment.id} comment={comment} deleteComment={handleDeleteComment}/>
                ))}
            </div>
        </SessionProvider>
    )
}