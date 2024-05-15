import DashboardProjectItem from "./DashboardProjectItem"

export default function DashboardTaskList({list, selectedProject, setSelectedProject}){
    return (
        <div className="pb-6 bg-dark-gray rounded-lg">
            <div className="p-4">
                <div className="text-base md:text-lg font-bold">Daftar Tugas Saya</div>
            </div>
            <div className="px-4 flex flex-col gap-2 max-h-[720px] overflow-x-hidden overflow-y-scroll">
                {list.map((project, index) => (
                    <DashboardProjectItem key={index} project={project} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
                ))}
            </div>
        </div>
    )
}