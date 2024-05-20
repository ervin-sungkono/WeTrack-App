import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import Label from "../common/Label";

export default function DashboardTaskItem({title, type, startDate, endDate, status, priority, projectKey, displayId, href, firstItem}){
    const { label, color } = getPriority(priority)
    return (
        <div>
            {!firstItem && (
                <div>
                    <hr className="mb-4 border border-dark-gray"/>
                </div>
            )}
            <div className="bg-white flex justify-between">
                <div className="flex flex-col justify-between">
                    <div className="text-sm md:text-base font-semibold">{title}</div>
                    {!startDate && !endDate ? (
                    <div className="text-xs md:text-sm">Tanggal mulai dan tenggat waktu belum ditetapkan</div>
                    ) : !startDate ? (
                        <div className="text-xs md:text-sm">Tenggat waktu: {dateFormat(endDate)}</div>
                    ) : !endDate ? (
                        <div className="text-xs md:text-sm">Tanggal mulai: {dateFormat(startDate)}</div>
                    ) : (
                        <div className="text-xs md:text-sm">{dateFormat(startDate)} - {dateFormat(endDate)}</div>
                    )}
                    <div className="mt-1 flex flex-col gap-1">
                        <div className="flex gap-1 font-semibold text-xs md:text-sm w-fit">
                            Status:
                            <Label text={status.toUpperCase()}/>
                        </div>
                        <div className="flex gap-1 font-semibold text-xs md:text-sm w-fit">
                            Prioritas: 
                            <Label text={label.toUpperCase()} color={color}/>
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                    <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                        {type === "Task" ? <TaskIcon className="text-lg md:text-xl"/> : <SubTaskIcon className="text-lg md:text-xl"/>}
                        {projectKey}-{displayId}
                    </div>
                    <a href={href}>
                        <div className="text-xs md:text-sm text-basic-blue cursor-pointer font-semibold">{`Lihat Rincian ->`}</div>
                    </a>
                </div>
            </div>
        </div>
    )
}