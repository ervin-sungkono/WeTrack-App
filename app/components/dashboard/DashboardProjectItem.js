import { useState } from "react";
import { IoIosArrowDown as DropdownIcon, IoIosArrowUp as DropdownCloseIcon } from "react-icons/io";

export default function DashboardProjectItem({project, setSelectedProject}){
    const [showTasks, setShowTasks] = useState(false)

    const handleShowTasks = () => {
        if(showTasks === false){
            setShowTasks(true)
            setSelectedProject(project)
        }else{
            setShowTasks(false)
        }
    }

    return (
        <>
            <div className="bg-white px-2 md:px-4 py-2 md:py-4 flex flex-col rounded-lg">
                <div className="flex justify-between items-center">
                    <a href={`/projects/${project.id}`}>
                        <div className="text-base md:text-lg text-basic-blue font-bold">
                            {project.projectName} ({project.tasks.length})
                        </div>
                    </a>
                    <div className="cursor-pointer" onClick={handleShowTasks}>
                        {showTasks ? <DropdownCloseIcon size={24}/> : <DropdownIcon size={24}/>}
                    </div>
                </div>
                {showTasks && (
                    <div className={`flex flex-col gap-2 mt-4`}>
                        {project.tasks.length > 0 ? (
                            project.tasks.map((task, index) => (
                                <div key={index}>
                                    <div className="text-sm md:text-base text-dark-blue font-semibold">
                                        {task.taskName}
                                    </div>
                                    <div className="text-xs md:text-sm text-dark-blue">
                                        {task.status.statusName}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs md:text-sm text-dark-blue">
                                Belum ada data tugas yang tersedia.
                            </div>
                        )}
                        
                    </div>
                )}
            </div>
        </>
    )
}