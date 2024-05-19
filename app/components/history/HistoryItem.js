import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"

export default function HistoryItem({eventType, action, task, project, previousValue, newValue, createdAt}){
    return (
        <div className="w-full bg-white flex flex-col md:flex-row items-end md:items-center px-4 py-2 rounded shadow-sm gap-3">
            <div className="w-full text-xs md:text-sm">
                {eventType === "Project" && action === "create" && (
                    <>
                        Anda membuat proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {eventType === "Project" && action === "delete" && (
                    <>
                        Anda menghapus proyek <span className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</span>
                    </>   
                )}
                {eventType === "Task" && action === "create" && (
                    <>
                        Anda membuat tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {eventType === "Task" && action === "delete" && (
                    <>
                        Anda menghapus tugas <span className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</span> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {eventType === "Task" && action === "update" && (
                    <div className="flex flex-col gap-1.5">
                        <div>
                            Anda mengubah status pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                        </div>
                        <div className="flex items-center gap-1 text-xs md:text-sm text-dark-blue">
                            <Label color="#47389F" text={previousValue}/> {"-->"} <Label color="#47389F" text={newValue}/>
                        </div>
                    </div>
                )}
                {eventType === "Comment" && action === "create" && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>
                )}
                {eventType === "Comment" && action === "delete" && (
                    <>
                        Anda menghapus komentar pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>
                )}
            </div>
            <div className="text-xs md:text-sm text-right whitespace-nowrap">
                {listDateFormat(createdAt)}
            </div>
        </div>
    )
}