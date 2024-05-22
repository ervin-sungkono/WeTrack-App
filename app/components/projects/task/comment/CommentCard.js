"use client"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { listDateFormat } from "@/app/lib/date"
import { extractSingleMentionTag } from "@/app/lib/string"

import UserIcon from "@/app/components/common/UserIcon"

import { RiChatDeleteFill as DeleteComment } from 'react-icons/ri'

export default function CommentCard({ comment, deleteComment }){
    const { data: session, status } = useSession()

    const renderComment = (comment) => {
        const splitPattern = /(@\[[^\]]+\]\([^)]+\))/g;
        const segments = comment.split(splitPattern)

        return segments.map((segment, index) => {
            if(!segment) return null
            const data = extractSingleMentionTag(segment)
            if(data.mention){
                return (
                    <Link 
                        key={`${segment}-${index}`} 
                        href={`/profile/${data.id}`} 
                        className="text-basic-blue font-semibold hover:underline"
                    >
                        @{data.name}
                    </Link>
                )
            }
            else{
                return <span key={`${segment}-${index}`}>{data.content}</span>
            }
        })
    }

    if(!session || status === 'loading') return null // nanti jadi skeleton loader
    if(!comment) return null
    return(
        <div key={comment.id} className="w-full flex gap-2 md:gap-3 pl-2 py-2">
            <UserIcon size="sm" fullName={comment.user?.fullName} src={comment.user?.profileImage?.attachmentStoragePath}/>
            <div className="w-full flex flex-col items-start gap-2.5">
                <div className="w-full flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <p className="text-xs md:text-sm text-dark-blue font-semibold">
                            {comment.user?.fullName}
                        </p>
                        <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(comment.createdAt)}</p>
                    </div>
                    <p className="text-xs md:text-sm text-dark-blue/80">
                        {renderComment(comment.commentText)}
                    </p>
                </div>
                {(comment.userId === session.user.uid) && deleteComment && 
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