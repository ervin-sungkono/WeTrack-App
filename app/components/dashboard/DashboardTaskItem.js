import { dateFormat } from "@/app/lib/date";
import { MdChecklist as TaskIcon } from "react-icons/md";

export default function DashboardTaskItem({title, startDate, endDate, status, priority, id, href, firstItem}){

    const getPriorityName = () => {
        switch(priority){
            case 0:
                return "Tinggi";
            case 1:
                return "Sedang";
            case 2:
                return "Rendah";
            case 3:
                return "Tidak Ada";
        }
    }

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
                    <div className="text-xs md:text-sm">{dateFormat(startDate)} - {dateFormat(endDate)}</div>
                    <div className="font-semibold text-xs md:text-sm">Status: {status.toUpperCase()}</div>
                    <div className="font-semibold text-xs md:text-sm">Prioritas: {getPriorityName().toUpperCase()}</div>
                </div>
                <div className="text-right flex flex-col justify-between">
                    <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                        <TaskIcon className="text-lg md:text-xl"/>
                        {id}
                    </div>
                    <a href={href}>
                        <div className="text-xs md:text-sm text-basic-blue cursor-pointer font-semibold">{`View Detail ->`}</div>
                    </a>
                </div>
            </div>
        </div>
    )
}