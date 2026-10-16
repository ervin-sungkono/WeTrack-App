import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import Label from "../../common/Label";
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import { FaCalendarAlt as CalendarIcon } from "react-icons/fa";
import Link from "next/link";
import type { FirestoreTimestampLike, TaskStatus, TaskType } from "@/app/types/domain"

interface AssignedTaskItemProps {
    title: string
    type: TaskType
    startDate?: FirestoreTimestampLike
    endDate?: FirestoreTimestampLike
    finishedDate?: FirestoreTimestampLike
    status: Pick<TaskStatus, "statusName" | "status"> | null
    priority?: number | null
    projectKey: string | null
    displayId?: number
    href: string
}

export default function AssignedTaskItem({title, type, startDate, endDate, finishedDate, status, priority, projectKey, displayId, href}: AssignedTaskItemProps){
    const priorityData = getPriority(priority) ?? { label: "Tidak ada", color: "#A9A9A9" }
    const statusName = status?.statusName ?? status?.status ?? "Belum ditentukan"

    return (
        <div className="bg-white flex flex-col justify-between p-4 w-full gap-4 rounded-md">
            <div className="flex flex-col justify-between gap-1">
                <div className="text-sm md:text-base font-semibold">{title}</div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        {startDate && (
                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                <CalendarIcon className="text-base md:text-lg"/>
                                Tanggal Mulai: {dateFormat(startDate) || "Belum Ditetapkan"}
                            </div>
                        )}
                        {(endDate && finishedDate == null) && (
                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                <CalendarIcon className="text-base md:text-lg"/>
                                Tenggat Waktu: {dateFormat(endDate)}
                            </div>
                        )}
                        {finishedDate && (
                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                <CalendarIcon className="text-base md:text-lg"/>
                                Tanggal Selesai: {dateFormat(finishedDate)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                            Status:
                                <Label text={statusName.toUpperCase()}/>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                            Prioritas:
                            <Label text={priorityData.label.toUpperCase()} color={priorityData.color}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                    {type === "Task" ? <TaskIcon className="text-lg md:text-xl"/> : <SubTaskIcon className="text-lg md:text-xl"/>}
                    {projectKey}-{displayId}
                </div>
                <Link href={href} className="flex items-center gap-1 text-basic-blue hover:text-basic-blue/80">
                    <span className="text-xs md:text-sm cursor-pointer font-semibold">Lihat Rincian</span>
                    <ArrowIcon aria-hidden="true" className="text-base md:text-lg"/>
                </Link>
            </div>
        </div>
    )
}
