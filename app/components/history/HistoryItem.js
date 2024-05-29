import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history"
import UserIcon from "../common/UserIcon"
import { GoArrowRight as ArrowIcon } from "react-icons/go";

export default function HistoryItem({eventType, action, task=null, taskId=null, project=null, projectId=null, previousValue=null, newValue=null, deletedValue=null, createdAt}){    
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
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>  
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus tugas <LinkText>{deletedValue}</LinkText> dalam proyek <LinkText href={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat subtugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada subtugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>  
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus subtugas <LinkText>{deletedValue}</LinkText> dalam proyek <LinkText href={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>   
                )}
                {(eventType === getHistoryEventType.taskName) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Nama Tugas</b> untuk tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={previousValue}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={newValue}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.taskStatus) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Status Tugas</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={previousValue.toUpperCase()}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={newValue.toUpperCase()}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.assignedTo) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Penerima</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                {previousValue == null ? (
                                    <>
                                        <UserIcon src={'/images/user-placeholder.png'} size="xs"/>
                                        <LinkText>{`Belum Ditugaskan`}</LinkText>
                                    </>
                                ) : (
                                    <>
                                        <UserIcon fullName={previousValue?.fullName} src={previousValue?.profileImage?.attachmentStoragePath} size="xs"/>
                                        <LinkText>{previousValue?.fullName}</LinkText>
                                    </>
                                )}
                            </div>
                            <div>
                                <ArrowIcon size={16} className="flex-shrink-0"/>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {newValue == null ? (
                                    <>
                                        <UserIcon src={'/images/user-placeholder.png'} size="xs"/>
                                        <LinkText>{`Belum Ditugaskan`}</LinkText>
                                    </>
                                ) : (
                                    <>
                                        <UserIcon fullName={newValue?.fullName} src={newValue?.profileImage?.attachmentStoragePath} size="xs"/>
                                        <LinkText>{newValue?.fullName}</LinkText>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat <b>Status Tugas</b> baru dalam proyek <LinkText link={`/projects/${projectId}/board`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Status Tugas</b> dalam proyek <LinkText link={`/projects/${projectId}/board`}>{project.projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={previousValue.toUpperCase()}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={newValue.toUpperCase()}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.delete) && (
                    <div className="flex gap-1.5">
                        <div>
                            Anda menghapus <b>Status Tugas</b>
                        </div>
                        <Label color="#47389F" text={deletedValue.toUpperCase()}/>
                        <div>
                            dalam proyek <LinkText link={`/projects/${projectId}/board`}>{project.projectName}</LinkText>.
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat <b>Komentar</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus <b>Komentar</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.create) && (
                    <>
                        Anda menambahkan <b>Lampiran</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus <b>Lampiran</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{task.taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{project.projectName}</LinkText>.
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