"use client"
import Link from "next/link"
import CustomTooltip from "../common/CustomTooltip"
import UserIcon from "../common/UserIcon"

import { FaCheckSquare as CheckIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import { useSessionStorage } from "usehooks-ts";

export default function TaskItem({ task, active }){
    const [project, _] = useSessionStorage("project")

    return(
        <Link href={`?taskId=${task.id}`} className={`bg-white rounded px-2.5 py-4 flex flex-col gap-1 ${active ? "border border-basic-blue pointer-events-none" : ""}`}>
            <p className="text-xs md:text-sm">{task.taskName}</p>
            <div className="flex items-center gap-2">
                <div className="flex flex-grow items-center gap-1 text-dark-blue">
                  {task.type === "Task" ? <CheckIcon size={16}/> : <SubTaskIcon size={16}/>}
                  <p className="text-[10px] md:text-xs">{project && <span>{project.key}-{task.displayId}</span>}</p>
                </div>
                <CustomTooltip id={`task-${task.id}-tooltip`} content={"Belum ditugaskan"}>
                  <UserIcon fullName={task.assignedTo} src={task.assignedTo ?? '/images/user-placeholder.png'} size="xs"/>
                </CustomTooltip>
            </div>
        </Link>
    )
}