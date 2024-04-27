"use client"
import Link from "next/link"
import CustomTooltip from "../common/CustomTooltip"
import UserIcon from "../common/UserIcon"

import { FaCheckSquare as CheckIcon } from "react-icons/fa";

export default function TaskItem({ task, active }){

    return(
        <Link href={`?taskId=${task.id}`} className={`bg-white rounded px-2.5 py-4 flex flex-col gap-1 ${active ? "border border-basic-blue" : ""}`}>
            <p className="text-xs md:text-sm">{task.taskName}</p>
            <div className="flex items-center gap-2">
                <div className="flex flex-grow items-center gap-1 text-dark-blue">
                  <CheckIcon size={16}/>
                  <p className="text-[10px] md:text-xs">TASK-1</p>
                </div>
                <CustomTooltip id={`task-${task.id}-tooltip`} content={"Belum ditugaskan"}>
                  <UserIcon fullName={task.assignedTo} src={task.assignedTo ?? '/user-placeholder.png'} size="xs"/>
                </CustomTooltip>
            </div>
        </Link>
    )
}