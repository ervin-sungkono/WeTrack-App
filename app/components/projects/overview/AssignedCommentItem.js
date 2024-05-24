import { extractSingleMentionTag } from "@/app/lib/string"
import { MdChecklist as TaskIcon } from "react-icons/md";
import UserIcon from "../../common/UserIcon";
import { listDateFormat } from "@/app/lib/date";
import { GoArrowRight as ArrowIcon } from "react-icons/go";

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
        <div className="bg-white flex flex-col justify-between p-4 w-full gap-4 rounded-md">
            <div className="flex justify-start items-start gap-2.5">
                <UserIcon size="sm" fullName={user.fullName} src={user.profileImage?.attachmentStoragePath} />
                <div className="w-full flex flex-col gap-1">
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-2 items-start lg:items-center">
                        <p className="text-xs md:text-sm text-dark-blue font-semibold">{user.fullName}</p>
                        <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(createdAt)}</p>
                    </div>
                    <p className="text-xs md:text-sm text-dark-blue/80">{renderComment(text)}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                    <TaskIcon className="text-lg md:text-xl"/>
                    {projectKey}-{displayId}
                </div>
                <a href={href}>
                    <div className="flex items-center gap-1 text-basic-blue hover:text-basic-blue/80">
                        <div className="text-xs md:text-sm cursor-pointer font-semibold">{`Lihat Rincian`}</div>
                        <ArrowIcon className="text-base md:text-lg"/>
                    </div>
                </a>
            </div>
        </div>
    )
}