import { IoIosArrowDown as DropdownIcon, IoIosArrowUp as DropdownCloseIcon } from "react-icons/io";
import DashboardTaskItem from "./DashboardTaskItem";

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
        <div className="bg-white flex flex-col rounded-lg">
            <div className="px-2 md:px-4 py-2 md:py-4 rounded-lg cursor-pointer" onClick={handleShowTasks}>
                <div className="flex justify-between items-center">
                    <div className={`text-sm md:text-base font-bold ${currentProject && "text-basic-blue"}`}>
                        {project.projectName} ({project.tasks.length})
                    </div>
                    <div className={`group-hover:text-basic-blue ${currentProject && "text-basic-blue"}`}>
                        {currentProject ? <DropdownCloseIcon size={20}/> : <DropdownIcon size={20}/>}
                    </div>
                </div>
            </div>
            {currentProject && (
                <div className="px-2 md:px-4 pb-2 md:pb-4">
                    <div className={`flex flex-col gap-4`}>
                        {project.tasks.length > 0 ? (
                            project.tasks.map((task, index) => (
                                <div key={index}>
                                    <DashboardTaskItem 
                                        key={index}
                                        title={task.taskName}
                                        startDate={task.startDate}
                                        endDate={task.dueDate}
                                        status={task.status.statusName}
                                        priority={task.priority}
                                        projectKey={project.key}
                                        displayId={task.displayId}
                                        href={`/projects/${project.id}/tasks?taskId=${task.id}`}
                                        firstItem={index === 0}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-xs md:text-sm text-dark-blue">
                                Belum ada data tugas yang tersedia.
                            </div>
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    )
}