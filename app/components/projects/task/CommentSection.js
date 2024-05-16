"use client"
import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { addComment } from "@/app/lib/fetch/comment"
import { deleteComment } from "@/app/lib/fetch/comment"
import { getQueryReference, getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import EmptyState from "../../common/EmptyState"
import PopUpForm from "../../common/alert/PopUpForm"
import Button from "../../common/button/Button"
import PopUpLoad from "../../common/alert/PopUpLoad"

const CommentInput  = dynamic(() => import("./comment/CommentInput"))
const CommentCard = dynamic(() => import("./comment/CommentCard"))

export default function CommentSection({ comments, setCommentData, taskId }){
    const [deleteFocus, setDeleteFocus] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [loading, setLoading] = useState(false)

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

    const showDeleteConfirmation = (deletedComment) => {
        setDeleteFocus(deletedComment)
        setDeleteConfirmation(true)
    }

    const hideDeleteConfirmation = () => {
        setDeleteFocus(null)
        setDeleteConfirmation(false)
    }

    const handleDeleteComment = async() => {
        setLoading(true)
        try{
            const res = await deleteComment({taskId: deleteFocus.taskId, commentId: deleteFocus.id})

            if(!res.ok){
                console.log("Gagal menghapus komentar")
            }
        }catch(e){
            console.log(error)
        }finally{
            setDeleteFocus(null)
            setDeleteConfirmation(false)
            setLoading(false)
        }
    }

    if(!comments){
        return(
            <div>Memuat data komentar..</div>
        )
    }
    return(
        <SessionProvider>
            <div className="flex flex-col">
                {loading && <PopUpLoad/>}
                {deleteConfirmation && 
                <PopUpForm
                    title={"Hapus Komentar"}
                    titleSize="large"
                    message={'Apakah Anda yakin ingin menghapus komentar ini?'}
                    wrapContent
                >
                    <>
                        <div className="border border-dark-blue/20 rounded">
                            <CommentCard comment={deleteFocus}/>
                        </div>
                        <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                            <Button variant="danger" onClick={handleDeleteComment}>Hapus</Button>
                            <Button variant="secondary" onClick={hideDeleteConfirmation}>Batal</Button>
                        </div>
                    </>
                </PopUpForm>}
                <CommentInput onSubmit={sendComment}/>
                {comments && (comments.length > 0 ? 
                comments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} deleteComment={showDeleteConfirmation}/>
                ))
                : 
                <div className="py-2">
                    <EmptyState message="Belum ada komentar yang tersedia.."/>
                </div>)}
            </div>
        </SessionProvider>
    )
}