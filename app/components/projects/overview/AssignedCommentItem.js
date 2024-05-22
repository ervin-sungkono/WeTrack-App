import Link from "next/link";
import { extractSingleMentionTag } from "@/app/lib/string"
import { MdChecklist as TaskIcon } from "react-icons/md";
import UserIcon from "../../common/UserIcon";
import { listDateFormat } from "@/app/lib/date";

export default function AssignedCommentItem({text, user, createdAt, projectKey, displayId, href}){
    const renderComment = (comment) => {
        const splitPattern = /(@\[[^\]]+\]\([^)]+\))/g;
        const segments = comment.split(splitPattern)

        return segments.map((segment, index) => {
            if(!segment) return null
            const data = extractSingleMentionTag(segment)
            if(data.mention){
                return (
                    <span 
                        key={`${segment}-${index}`}
                        className="text-basic-blue font-semibold"
                    >
                        @{data.name}
                    </span>
                )
            }
            else{
                return <span key={`${segment}-${index}`}>{data.content}</span>
            }
        })
    }

    return (
        <div className="bg-white flex justify-between p-4 w-full gap-2 rounded-md">
            <div className="flex justify-start gap-2.5">
                <UserIcon size="sm" fullName={user.fullName} src={user.profileImage?.attachmentStoragePath} />
                <div className="w-full flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <p className="text-xs md:text-sm text-dark-blue font-semibold">{user.fullName}</p>
                        <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(createdAt)}</p>
                    </div>
                    <p className="text-xs md:text-sm text-dark-blue/80">{renderComment(text)}</p>
                </div>
            </div>
            <div className="text-right flex flex-col justify-between">
                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                    <TaskIcon className="text-lg md:text-xl"/>
                    {projectKey}-{displayId}
                </div>
                <a href={href}>
                    <div className="text-xs md:text-sm text-basic-blue cursor-pointer font-semibold hover:underline">{`Lihat Rincian`}</div>
                </a>
            </div>
        </div>
    )
}