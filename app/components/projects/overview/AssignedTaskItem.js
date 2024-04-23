import { dateFormat } from "@/app/lib/date";
import { MdChecklist as TaskIcon } from "react-icons/md";

export default function AssignedTaskItem({title, startDate, endDate, status, id}){
    return (
        <div className="bg-white flex justify-between p-4">
            <div className="flex flex-col justify-between gap-1">
                <div className="text-sm md:text-base font-bold">{title}</div>
                <div className="text-xs md:text-sm">{dateFormat(startDate)} - {dateFormat(endDate)}</div>
                <div className="font-bold text-xs md:text-sm">Status: {status}</div>
            </div>
            <div className="text-right flex flex-col justify-between">
                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                    <TaskIcon className="text-lg md:text-xl"/>
                    {id}
                </div>
                <div className="text-xs md:text-sm text-basic-blue cursor-pointer">{`View Detail ->`}</div>
            </div>
        </div>
    )
}