import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history"
import UserIcon from "../common/UserIcon"

export default function HistoryItem({eventType, action, task=null, taskId=null, project=null, projectId=null, previousValue=null, newValue=null, deletedValue=null, createdAt}){    
    const LinkText = ({link, children}) => {
        if(link != null){
            return <Link href={link} className="text-xs md:text-sm font-bold text-basic-blue">{children}</Link>
        }else{
            return <span className="text-xs md:text-sm font-bold text-basic-blue">{children}</span>
        }
    }

    return (
        <div className="w-full bg-white flex flex-col md:flex-row items-end md:items-center px-4 py-2 rounded shadow-sm gap-3">
            <div className="w-full text-xs md:text-sm">
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>  
                )}
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus proyek <LinkText>{deletedValue}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus tugas <LinkText>{deletedValue}</LinkText> dalam proyek <LinkText href={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.taskName) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda melakukan perubahan data pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            Nama tugas baru:
                            <div className="flex items-center gap-1.5">
                                {previousValue} {"-->"} <LinkText>{newValue}</LinkText>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.taskStatus) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda melakukan perubahan data pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            Status tugas baru:
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={previousValue}/> {"-->"} <Label color="#47389F" text={newValue}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.assignedTo) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda melakukan perubahan data pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            Penerima tugas baru:
                            <div className="flex items-center gap-1.5">
                                <UserIcon fullName={newValue.fullName} profileImage={newValue.profileImage} />
                                <span>{newValue.fullName}</span>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat komentar pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus komentar pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.create) && (
                    <>
                        Anda menambahkan lampiran pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus lampiran pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.profile) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada <LinkText link={`/profile`}>profil Anda</LinkText>.
                    </>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt)}
            </div>
        </div>
    )
}