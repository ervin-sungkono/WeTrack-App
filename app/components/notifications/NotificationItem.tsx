import Link from "next/link"
import type { ReactNode } from "react"
import UserIcon from "../common/UserIcon"
import { listDateFormat } from "@/app/lib/date"
import type { NotificationRow } from "../types"

function LinkText({ link, children }: { link?: string | null; children: ReactNode }) {
    return link
        ? <Link href={link} className="text-xs md:text-sm font-bold text-basic-blue">{children}</Link>
        : <span className="text-xs md:text-sm font-bold">{children}</span>
}

function profileImagePath(sender: NotificationRow["sender"]): string | undefined {
    const image = sender?.profileImage
    return image && typeof image === "object" ? image.attachmentStoragePath : undefined
}

export default function NotificationsItem({ type, task, taskId, sender, senderId, project, projectId, newValue, createdAt }: NotificationRow) {
    const senderName = sender?.fullName ?? "Pengguna"
    const taskName = task?.taskName ?? "tugas"
    const projectName = project?.projectName ?? "proyek"
    const senderHref = senderId ? `/profile/${senderId}` : undefined
    const taskHref = projectId && taskId ? `/projects/${projectId}/tasks?taskId=${taskId}` : undefined
    const projectHref = projectId ? `/projects/${projectId}` : undefined

    const senderIcon = <UserIcon fullName={senderName} src={profileImagePath(sender)} size="xs" />

    return (
        <div className="w-full bg-white flex flex-col md:flex-row gap-2 md:gap-0 items-end md:items-center px-4 py-3 rounded shadow-md">
            <div className="w-full text-xs md:text-sm">
                {type === "AssignedTask" && (
                    <>Anda diberikan tugas <LinkText link={taskHref}>{taskName}</LinkText> dalam proyek <LinkText link={projectHref}>{projectName}</LinkText>.</>
                )}
                {type === "AddedComment" && (
                    <div className="flex items-center gap-1.5">
                        {senderHref ? <Link href={senderHref}>{senderIcon}</Link> : senderIcon}
                        <div>
                            <LinkText link={senderHref}>{senderName}</LinkText> membuat komentar pada tugas Anda <LinkText link={taskHref}>{taskName}</LinkText> dalam proyek <LinkText link={projectHref}>{projectName}</LinkText>.
                        </div>
                    </div>
                )}
                {type === "Mention" && (
                    <div className="flex items-center gap-1.5">
                        {senderHref ? <Link href={senderHref}>{senderIcon}</Link> : senderIcon}
                        <div>
                            <LinkText link={senderHref}>{senderName}</LinkText> menyebut Anda dalam komentarnya pada tugas <LinkText link={taskHref}>{taskName}</LinkText> dalam proyek <LinkText link={projectHref}>{projectName}</LinkText>.
                        </div>
                    </div>
                )}
                {type === "RoleChange" && (
                    <>Peran Anda dalam proyek <LinkText link={projectHref}>{projectName}</LinkText> telah diubah ke <LinkText>{typeof newValue === "string" ? newValue : ""}</LinkText>.</>
                )}
                {type === "ReceiveInvitation" && (
                    <div className="flex items-center gap-1.5">
                        {senderHref ? <Link href={senderHref}>{senderIcon}</Link> : senderIcon}
                        <div>
                            <LinkText link={senderHref}>{senderName}</LinkText> mengundang Anda untuk bergabung dalam proyek <LinkText link={projectHref}>{projectName}</LinkText>, silakan cek email Anda.
                        </div>
                    </div>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt ?? null)}
            </div>
        </div>
    )
}
