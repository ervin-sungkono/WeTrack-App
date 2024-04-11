import { createContext, useState, useContext } from "react"
import { SessionProvider } from "next-auth/react"
import TaskDetail from "@/app/components/projects/task/TaskDetail"

const TaskContext = createContext({})

export const TaskProvider = ({ children }) => {
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [isOpen, setOpen] = useState(false)

    const viewTask = (taskId) => {
        if(selectedTaskId !== taskId) setSelectedTaskId(taskId)
        setOpen(true)
    }

    return(
        <SessionProvider>
            <TaskContext.Provider value={{viewTask}}>
                {selectedTaskId && <TaskDetail 
                    taskId={selectedTaskId}
                    open={isOpen} 
                    closeFn={() => setOpen(false)}
                />}
                {children}
            </TaskContext.Provider>
        </SessionProvider>
    )
}

export const useTaskData = () => useContext(TaskContext)