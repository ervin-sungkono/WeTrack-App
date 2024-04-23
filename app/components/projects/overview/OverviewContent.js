import AssignedTaskItem from "./AssignedTaskItem";
import OverviewCard from "./OverviewCard";
import { GoPlus as PlusIcon } from "react-icons/go";

export default function OverviewContent(){

    const assignedTasksDummyData = [
        {
            title: "Create Landing Page",
            startDate: new Date("2024-04-17"),
            endDate: new Date("2024-04-20"),
            status: "TO DO",
            id: "TASK-1"
        },
        {
            title: "API Integration",
            startDate: new Date("2024-04-09"),
            endDate: new Date("2024-04-15"),
            status: "IN PROGRESS",
            id: "TASK-2"
        },
    ]

    return(
        <div className="flex flex-col gap-4">
            <OverviewCard title="Tugas Terbaru" action={"Lihat semua"}>
                
            </OverviewCard>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <OverviewCard title="Ditugaskan Kepada Saya" action={<PlusIcon className="text-xl md:text-2xl" />}>
                    <div className="flex flex-col gap-2">
                        {assignedTasksDummyData.map((task, index) => (
                            <AssignedTaskItem key={index} {...task}/>
                        ))}
                    </div>
                </OverviewCard>
                <OverviewCard title="Komentar Terbaru">

                </OverviewCard>
            </div>
        </div>
    )
}