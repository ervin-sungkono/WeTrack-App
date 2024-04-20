"use client"
import { SessionProvider } from "next-auth/react"
import dynamic from "next/dynamic"

const CommentInput  = dynamic(() => import("./comment/CommentInput"))
const CommentCard = dynamic(() => import("./comment/CommentCard"))

export default function CommentSection({ comments }){
    if(!comments){
        return(
            <div>Memuat data komentar..</div>
        )
    }
    return(
        <SessionProvider>
            <div className="flex flex-col">
                <CommentInput/>
                {comments?.map(comment => (
                    <CommentCard key={comment.id} comment={comment}/>
                ))}
            </div>
        </SessionProvider>
    )
}