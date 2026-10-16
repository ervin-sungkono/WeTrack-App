import Link from "next/link"
import type { ReactNode } from "react"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"
import { getHistoryAction, getHistoryEventType } from "@/app/lib/history"
import UserIcon from "../common/UserIcon"
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import type { HistoryRow } from "../types"

function valueText(value: unknown): string {
    if (typeof value === "string") return value
    if (typeof value === "object" && value !== null && "fullName" in value && typeof value.fullName === "string") {
        return value.fullName
    }
    return ""
}

function profileName(value: unknown): string {
    return valueText(value)
}

function profileId(value: unknown): string {
    if (typeof value !== "object" || value === null || !("id" in value)) return ""
    return typeof value.id === "string" ? value.id : ""
}

function profileImagePath(value: unknown): string | undefined {
    if (typeof value !== "object" || value === null || !("profileImage" in value)) return undefined
    const image = value.profileImage
    if (typeof image !== "object" || image === null || !("attachmentStoragePath" in image)) return undefined
    return typeof image.attachmentStoragePath === "string" ? image.attachmentStoragePath : undefined
}

function LinkText({link, children}: { link?: string | null; children: ReactNode }) {
    return link != null
        ? <Link href={link} className="text-xs md:text-sm font-bold text-basic-blue">{children}</Link>
        : <span className="text-xs md:text-sm font-bold">{children}</span>
}

export default function HistoryItem({eventType, action, task=null, taskId=null, project=null, projectId=null, previousValue=null, newValue=null, deletedValue=null, createdAt}: HistoryRow){
    const taskName = task?.taskName ?? "tugas yang dihapus"
    const projectName = project?.projectName ?? "proyek yang dihapus"

    return (
        <div className="w-full bg-white flex flex-col md:flex-row gap-2 md:gap-0 items-end md:items-center px-4 py-3 rounded shadow-md">
            <div className="w-full text-xs md:text-sm">
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.project) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus proyek <LinkText>{valueText(deletedValue)}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.task) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus tugas <LinkText>{valueText(deletedValue)}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat subtugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada subtugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.subtask) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus subtugas <LinkText>{valueText(deletedValue)}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.taskName) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Nama Tugas</b> untuk tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={valueText(previousValue)}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={valueText(newValue)}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.taskStatus) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Status Tugas</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={valueText(previousValue).toUpperCase()}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={valueText(newValue).toUpperCase()}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.assignedTo) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Penerima</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
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
                                        <UserIcon fullName={profileName(previousValue)} src={profileImagePath(previousValue)} size="xs"/>
                                        <LinkText>{profileName(previousValue)}</LinkText>
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
                                        <UserIcon fullName={profileName(newValue)} src={profileImagePath(newValue)} size="xs"/>
                                        <LinkText>{profileName(newValue)}</LinkText>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat <b>Status Tugas</b> baru dalam proyek <LinkText link={`/projects/${projectId}/board`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.update) && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah <b>Status Tugas</b> dalam proyek <LinkText link={`/projects/${projectId}/board`}>{projectName}</LinkText>.
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs md:text-sm text-dark-blue">
                            <div className="flex items-center gap-1.5">
                                <Label color="#47389F" text={valueText(previousValue).toUpperCase()}/> <ArrowIcon size={16} className="flex-shrink-0"/> <Label color="#47389F" text={valueText(newValue).toUpperCase()}/>
                            </div>
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.status) && (action === getHistoryAction.delete) && (
                    <div className="flex gap-1.5">
                        <div>
                            Anda menghapus <b>Status Tugas</b>
                        </div>
                        <Label color="#47389F" text={valueText(deletedValue).toUpperCase()}/>
                        <div>
                            dalam proyek <LinkText link={`/projects/${projectId}/board`}>{projectName}</LinkText>.
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.create) && (
                    <>
                        Anda membuat <b>Komentar</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.comment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus <b>Komentar</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.create) && (
                    <>
                        Anda menambahkan <b>Lampiran</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.attachment) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menghapus <b>Lampiran</b> pada tugas <LinkText link={`/projects/${projectId}/tasks?taskId=${taskId}`}>{taskName}</LinkText> dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.profile) && (action === getHistoryAction.update) && (
                    <>
                        Anda melakukan perubahan data pada <LinkText link={`/profile`}>profil Anda</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.invitation) && (action === getHistoryAction.create) && (
                    <div className="flex items-center gap-1.5">
                        <div>
                            Anda mengundang
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Link href={`/profile/${profileId(newValue)}`}>
                                <UserIcon fullName={profileName(newValue)} src={profileImagePath(newValue)} size="xs"/>
                            </Link>
                            <div>
                                <LinkText link={`/profile/${profileId(newValue)}`}>{profileName(newValue)}</LinkText>
                            </div>
                        </div>
                        <div>
                            untuk bergabung dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                        </div>
                    </div>
                )}
                {(eventType === getHistoryEventType.invitation) && (action === getHistoryAction.update) && (
                    <>
                        Anda menerima undangan untuk bergabung dalam proyek <LinkText link={`/projects/${projectId}`}>{projectName}</LinkText>.
                    </>
                )}
                {(eventType === getHistoryEventType.invitation) && (action === getHistoryAction.delete) && (
                    <>
                        Anda menolak undangan untuk bergabung dalam proyek <LinkText>{projectName}</LinkText>.
                    </>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt ?? null)}
            </div>
        </div>
    )
}
