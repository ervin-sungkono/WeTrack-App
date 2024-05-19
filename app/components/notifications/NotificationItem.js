import Link from "next/link"
import UserIcon from "../common/UserIcon"
import { listDateFormat } from "@/app/lib/date"

export default function NotificationsItem({type, task=null, taskId=null, sender=null, senderId=null, project, projectId, newValue, createdAt}){
    let oldValue
    if(type === "RoleChange"){
        if(newValue === "Viewer"){
            oldValue = "Member"
        }else{
            oldValue = "Viewer"
        }
    }

    return (
        <div className="w-full bg-white flex justify-between items-center px-4 py-2 rounded shadow-sm">
            <div className="w-7/10 md:w-3/4 text-xs md:text-md">
                {type === "AssignedTask" && (
                    <>
                        Anda diberikan tugas <Link href={`/projects/${projectId}/tasks?taskId=${taskId}`} className="text-xs md:text-md font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${projectId}`} className="font-bold text-basic-blue">{project.projectName}.</Link>
                    </>   
                )}
                {type === "AddedComment" && (
                    <div className="flex items-center gap-2">
                        <div>
                            <UserIcon fullName={sender.fullName} />
                        </div>
                        <div>
                            <div>
                                <Link href={`/profile/${senderId}`} className="text-xs md:text-md font-bold text-basic-blue">{sender.fullName}</Link> membuat komentar pada tugas Anda <Link href={`/projects/${projectId}/tasks?taskId=${taskId}`} className="font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${projectId}`} className="font-bold text-basic-blue">{project.projectName}.</Link>
                            </div>
                            <div>
                                <Link href={`/projects/${projectId}/tasks?taskId=${taskId}`} className="text-xs md:text-md text-basic-blue">Lihat Komentar</Link>
                            </div>
                        </div>
                    </div>
                )}
                {type === "Mention" && (
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${senderId}`}>
                            <UserIcon fullName={sender.fullName} profileImage={sender.profileImage} />
                        </Link>
                        <div>
                            <div>
                                <Link href={`/profile/${senderId}`} className="text-xs md:text-md font-bold text-basic-blue">{sender.fullName}</Link> menyebut Anda dalam komentarnya pada tugas <Link href={`/projects/${projectId}/tasks?taskId=${taskId}`} className="text-xs md:text-md font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${projectId}`} className="text-xs md:text-md font-bold text-basic-blue">{project.projectName}.</Link>
                            </div>
                            <div>
                                <Link href={`/projects/${projectId}/tasks?taskId=${taskId}`} className="text-xs md:text-md text-basic-blue">Lihat Balasan</Link>
                            </div>
                        </div>
                    </div>
                )}
                {type === "RoleChange" && (
                    <>
                        Peran Anda dalam proyek <Link href={`/projects/${projectId}`} className="text-xs md:text-md font-bold text-basic-blue">{project.projectName}</Link> telah diubah dari <span className="text-xs md:text-md font-bold">{oldValue}</span> menjadi <span className="text-xs md:text-md font-bold">{newValue}.</span>
                    </>
                )}
            </div>
            <div className="w-3/10 md:w-1/4 text-xs md:text-sm text-right">
                {listDateFormat(createdAt.seconds)}
            </div>
        </div>
    )
}