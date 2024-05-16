import DashboardProjectItem from "./DashboardProjectItem"

export default function DashboardTaskList({list, selectedProject, setSelectedProject}){
    return (
        <div className="max-h-[560px] md:h-full md:overflow-y-auto flex flex-col bg-dark-gray rounded-lg pb-6 md:pb-0 ">
            <div className="p-4">
                <div className="text-base md:text-lg font-bold">Daftar Tugas Saya</div>
            </div>
            <div className="px-4 flex flex-grow flex-col gap-2 md:h-full overflow-y-auto custom-scrollbar">
                {list.map((project, index) => (
                    <DashboardProjectItem key={index} project={project} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                ))}
            </div>
        </div>
    )
}