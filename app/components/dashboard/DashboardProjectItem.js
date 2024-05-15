import { IoIosArrowDown as DropdownIcon, IoIosArrowUp as DropdownCloseIcon } from "react-icons/io";

export default function DashboardProjectItem({project, selectedProject, setSelectedProject}){
    const currentProject = selectedProject && selectedProject.id === project.id;

    const handleShowTasks = () => {
        if(currentProject){
            setSelectedProject(null)
        }else{
            setSelectedProject(project)
        }
    }

    return (
        <>
            <div className="bg-white flex flex-col rounded-lg">
                <div className="px-2 md:px-4 py-2 md:py-4 rounded-lg cursor-pointer group" onClick={handleShowTasks}>
                    <div className="flex justify-between items-center">
                        <div className={`text-sm md:text-base font-bold group-hover:underline group-hover:text-basic-blue ${currentProject && "text-basic-blue group-hover:text-basic-blue/75"}`}>
                            {project.projectName} ({project.tasks.length})
                        </div>
                        <div className={`group-hover:text-basic-blue ${currentProject && "text-basic-blue"}`}>
                            {currentProject ? <DropdownCloseIcon size={20}/> : <DropdownIcon size={20}/>}
                        </div>
                    </div>
                </div>
                {currentProject && (
                    <div className="px-2 md:px-4 pb-2 md:pb-4">
                        <div className={`flex flex-col gap-2`}>
                            {project.tasks.length > 0 ? (
                                project.tasks.map((task, index) => (
                                    <div key={index}>
                                        <div className="text-sm md:text-base text-dark-blue font-semibold">
                                            {task.taskName}
                                        </div>
                                        <div className="text-xs md:text-sm text-dark-blue">
                                            {task.status.statusName.toUpperCase()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs md:text-sm text-dark-blue italic">
                                    Belum ada data tugas yang tersedia.
                                </div>
                            )}
                            
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}