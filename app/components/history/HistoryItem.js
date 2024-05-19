import Link from "next/link"
import { listDateFormat } from "@/app/lib/date"
import Label from "../common/Label"

export default function HistoryItem({eventType, action, task, project, previousValue, newValue, createdAt}){
    return (
        <div className="w-full bg-white flex flex-col md:flex-row items-end md:items-center px-4 py-2 rounded shadow-sm gap-3">
            <div className="w-full text-xs md:text-sm">
                {(eventType === "Project" || eventType === "Proyek") && (action === "create" || action === "membuat") && (
                    <>
                        Anda membuat proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {(eventType === "Project" || eventType === "Proyek") && (action === "update" || action === "mengubah") && (
                    <>
                        Anda melakukan perubahan dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>  
                )}
                {(eventType === "Project" || eventType === "Proyek") && (action === "delete" || action === "menghapus") && (
                    <>
                        Anda menghapus proyek <span className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</span>
                    </>   
                )}
                {(eventType === "Task" || eventType === "Tugas") && (action === "create" || action === "membuat") && (
                    <>
                        Anda membuat tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {(eventType === "Task" || eventType === "Tugas") && (action === "update" || action === "mengubah") && (
                    // <div className="flex flex-col gap-1.5">
                    //     <div>
                    //         Anda mengubah status pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    //     </div>
                    //     <div className="flex items-center gap-1 text-xs md:text-sm text-dark-blue">
                    //         <Label color="#47389F" text={previousValue}/> {"-->"} <Label color="#47389F" text={newValue}/>
                    //     </div>
                    // </div>
                    <>
                        Anda melakukan perubahan pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>  
                )}
                {(eventType === "Task" || eventType === "Tugas") && (action === "delete" || action === "menghapus") && (
                    <>
                        Anda menghapus tugas <span className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</span> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {(eventType === "TaskName" || eventType === "Nama Tugas") && (action === "update" || action === "mengubah") && (
                    // <div className="flex flex-col gap-1.5">
                    //     <div>
                    //         Anda mengubah status pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    //     </div>
                    //     <div className="flex items-center gap-1 text-xs md:text-sm text-dark-blue">
                    //         <Label color="#47389F" text={previousValue}/> {"-->"} <Label color="#47389F" text={newValue}/>
                    //     </div>
                    // </div>
                    <>
                        Anda melakukan perubahan pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>  
                )}
                {(eventType === "TaskStatus" || eventType === "Status Tugas") && (action === "create" || action === "membuat") && (
                    <>
                        Anda membuat status tugas dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {(eventType === "TaskStatus" || eventType === "Status Tugas") && (action === "update" || action === "mengubah") && (
                    // <div className="flex flex-col gap-1.5">
                    //     <div>
                    //         Anda mengubah status pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    //     </div>
                    //     <div className="flex items-center gap-1 text-xs md:text-sm text-dark-blue">
                    //         <Label color="#47389F" text={previousValue}/> {"-->"} <Label color="#47389F" text={newValue}/>
                    //     </div>
                    // </div>
                    <>
                        Anda melakukan perubahan pada status tugas dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>  
                )}
                {(eventType === "TaskStatus" || eventType === "Status Tugas") && (action === "delete" || action === "menghapus") && (
                    <>
                        Anda menghapus status tugas dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>   
                )}
                {(eventType === "Comment" || eventType === "Komentar") && (action === "create" || action === "membuat") && (
                    <>
                        Anda membuat komentar pada tugas <Link href={`/projects/${project.id}/tasks?taskId=${task.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{task.taskName}</Link> dalam proyek <Link href={`/projects/${project.id}`} className="text-xs md:text-sm font-bold text-basic-blue">{project.projectName}</Link>
                    </>
                )}
                {(eventType === "Comment" || eventType === "Komentar") && (action === "delete" || action === "menghapus") && (
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