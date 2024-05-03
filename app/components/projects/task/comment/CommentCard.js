"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { listDateFormat } from "@/app/lib/date"

import UserIcon from "@/app/components/common/UserIcon"

import { RiChatDeleteFill as DeleteComment } from 'react-icons/ri'

export default function CommentCard({ comment, deleteComment }){
    const [user, setUser] = useState()
    const { data: session, status } = useSession()

    useEffect(() => {
        if(comment){
            // get user berdasarkan id user dari comment.userId
            const user = {
                fullName: "Ervin Cahyadinata Sungkono",
                profileImage: null
            }
            setUser(user)
        }
    }, [comment])

    if(status === 'loading') return null // nanti jadi skeleton loader
    if(!user || !comment) return null
    return(
        <div key={comment.id} className="w-full flex gap-2 md:gap-3 pl-2 py-2">
            <UserIcon size="sm" fullName={user.fullName} src={user.profileImage}/>
            <div className="w-full flex flex-col items-start gap-2.5">
                <div className="w-full flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <p className="text-xs md:text-sm text-dark-blue font-semibold">
                            {user.fullName}
                        </p>
                        <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(comment.createdAt)}</p>
                    </div>
                    <p className="markdown text-xs md:text-sm text-dark-blue/80">
                        {comment.commentText}
                    </p>
                </div>
                {comment.userId === session.user.uid && 
                <button 
                    className="flex items-center gap-2 text-danger-red hover:underline" 
                    onClick={() => deleteComment(comment)}
                >
                    <DeleteComment size={16}/>
                    <p className="text-xs md:text-sm font-semibold">Hapus</p>
                </button>}
            </div>
        </div>
    )
}