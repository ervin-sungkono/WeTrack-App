import DashboardProjectItem from "./DashboardProjectItem"

export default function DashboardTaskList({list, selectedProject, setSelectedProject}){
    return (
        <div className="md:h-full md:overflow-y-auto bg-dark-gray rounded-lg pb-6 md:pb-0 custom-scrollbar">
            <div className="p-4 sticky top-0 bg-dark-gray">
                <div className="text-base md:text-lg font-bold">Daftar Tugas Saya</div>
            </div>
            <div className="px-4 flex flex-col gap-2 md:h-full md:overflow-y-auto">
                {list.map((project, index) => (
                    <DashboardProjectItem key={index} project={project} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                ))}
            </div>
        </div>
    )
}