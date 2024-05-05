"use client"
import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import dynamic from "next/dynamic"

import { addComment } from "@/app/lib/fetch/comment"
import { deleteComment } from "@/app/lib/fetch/comment"
import { getQueryReference, getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"

const CommentInput  = dynamic(() => import("./comment/CommentInput"))
const CommentCard = dynamic(() => import("./comment/CommentCard"))

export default function CommentSection({ comments, setCommentData, taskId }){
    useEffect(() => {
        if(!taskId) return
        const reference = getQueryReference({ collectionName: "comments", field: "taskId", id: taskId })
        const unsubscribe = onSnapshot(reference, async(snapshot) => {
            const updatedComments = await Promise.all(snapshot.docs.map(async(document) => {
                const userId = document.data().userId
                if(userId){
                    const userRef = getDocumentReference({ collectionName: "users", id: userId })
                    const userSnap = await getDoc(userRef)
                    const { fullName, profileImage } = userSnap.data()

                    return({
                        id: document.id,
                        user: {
                            fullName,
                            profileImage
                        },
                        ...document.data()
                    })
                }
                return({
                    id: document.id,
                    user: null,
                    ...document.data()
                })
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