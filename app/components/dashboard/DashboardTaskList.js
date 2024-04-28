import DashboardProjectItem from "./DashboardProjectItem"

export default function DashboardTaskList({list}){
    return (
        <div className="pb-6 bg-dark-gray rounded-lg">
            <div className="p-4">
                <div className="text-lg md:text-xl font-bold">Tugas Saya</div>
            </div>
            <div className="px-4 flex flex-col gap-2">
                {list.map((project, index) => (
                    <DashboardProjectItem key={index} project={project}/>
                ))}
            </div>
        </div>
    )
}