import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import Label from "../../common/Label";
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import { FaCalendarAlt as CalendarIcon } from "react-icons/fa";

export default function AssignedTaskItem({title, type, startDate, endDate, status, priority, projectKey, displayId, href}){
    const { label, color } = getPriority(priority)

    return (
        <div className="bg-white flex flex-col justify-between p-4 w-full gap-4 rounded-md">
            <div className="flex flex-col justify-between">
                <div className="text-sm md:text-base font-semibold">{title}</div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        {startDate && (
                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                <CalendarIcon className="text-base md:text-lg"/>
                                Tanggal Mulai: {dateFormat(startDate) || "Belum Ditetapkan"}
                            </div>
                        )}
                        {endDate && (
                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                <CalendarIcon className="text-base md:text-lg"/>
                                Tenggat Waktu: {dateFormat(endDate) || "Belum Ditetapkan"}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                            Status:
                            <Label text={status.statusName.toUpperCase()}/>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                            Prioritas: 
                            <Label text={label.toUpperCase()} color={color}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                    {type === "Task" ? <TaskIcon className="text-lg md:text-xl"/> : <SubTaskIcon className="text-lg md:text-xl"/>}
                    {projectKey}-{displayId}
                </div>
                <a href={href}>
                    <div className="flex items-center gap-1 text-basic-blue hover:text-basic-blue/80">
                        <div className="text-xs md:text-sm cursor-pointer font-semibold">{`Lihat Rincian`}</div>
                        <ArrowIcon className="text-base md:text-lg"/>
                    </div>
                </a>
            </div>
        </div>
    )
}