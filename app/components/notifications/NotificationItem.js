import Link from "next/link"
import UserIcon from "../common/UserIcon"
import { listDateFormat } from "@/app/lib/date"

export default function NotificationsItem({type, task=null, taskId=null, sender=null, senderId=null, project, projectId, newValue, createdAt}){
    const LinkText = ({link, children}) => {
        if(link != null){
            return <Link href={link} className="text-xs md:text-sm font-bold text-basic-blue">{children}</Link>
        }else{
            return <span className="text-xs md:text-sm font-bold text-basic-blue">{children}</span>
        }
    }

    return (
        <div className="w-full bg-white flex flex-col md:flex-row gap-2 md:gap-0 items-end md:items-center px-4 py-3 rounded shadow-md">
            <div className="w-full text-xs md:text-sm">
                {type === "AssignedTask" && (
                    <>
                        Anda diberikan tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {type === "AddedComment" && (
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${senderId}`}>
                            <UserIcon fullName={sender.fullName} src={sender.profileImage?.attachmentStoragePath} size="xs"/>
                        </Link>
                        <div>
                            <div>
                                <LinkText link={`/profile/${senderId}`}>{sender.fullName}</LinkText> membuat komentar pada tugas Anda <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                            </div>
                        </div>
                    </div>
                )}
                {type === "Mention" && (
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${senderId}`}>
                            <UserIcon fullName={sender.fullName} src={sender.profileImage?.attachmentStoragePath} size="xs"/>
                        </Link>
                        <div>
                            <div>
                                <LinkText link={`/profile/${senderId}`}>{sender.fullName}</LinkText> menyebut Anda dalam komentarnya pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                            </div>
                        </div>
                    </div>
                )}
                {type === "RoleChange" && (
                    <>
                        Peran Anda dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText> telah diubah ke <LinkText>{newValue}</LinkText>.
                    </>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt)}
            </div>
        </div>
    )
}