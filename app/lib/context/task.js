import { createContext, useState, useContext } from "react"
import TaskDetail from "@/app/components/projects/task/TaskDetail"
import PopUp from "@/app/components/common/alert/PopUp"
import PopUpForm from "@/app/components/common/alert/PopUpForm";
import Button from "@/app/components/common/button/Button";
import PopUpLoad from "@/app/components/common/alert/PopUpLoad";
import UpdateTaskNameForm from "@/app/components/common/form/UpdateTaskNameForm";
import { deleteTask, updateTask } from "@/app/lib/fetch/task";

const TaskContext = createContext({})

export const TaskProvider = ({ children }) => {
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [isOpen, setOpen] = useState(false)
    const [focusTask, setFocusTask] = useState(null)
    const [loading, setLoading] = useState(false)
    const [updateConfirmation, setUpdateConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)

    const viewTask = (taskId) => {
        if(selectedTaskId !== taskId) setSelectedTaskId(taskId)
        setOpen(true)
    }

    const focusUpdateTask = (task) => {
        setFocusTask(task)
        setUpdateConfirmation(true)
    }

    const focusDeleteTask = (task) => {
        setFocusTask(task)
        setDeleteConfirmation(true)
    }

    const handleUpdateTaskName = async(values) => {
        setLoading(true)
  
        try{
          if(values.taskName !== focusTask.taskName) await updateTask({ taskId: focusTask.id, taskName: values.taskName.trim() })
        }catch(e){
          console.log(e)
        }finally{
          setUpdateConfirmation(false)
          setLoading(false)
        }
    }
  
    const handleDeleteTask = async() => {
        setLoading(true)

        try{
            await deleteTask({ taskId: focusTask.id })
        }catch(e){
            console.log(e)
        }finally{
            setDeleteConfirmation(false)
            setLoading(false)
        }
    }

    return(
        <TaskContext.Provider value={{viewTask, focusUpdateTask, focusDeleteTask}}>
            <PopUp open={isOpen}>
                <TaskDetail 
                    taskId={selectedTaskId}
                    closeFn={() => setOpen(false)}
                />
            </PopUp>
            {loading && <PopUpLoad/>}
            {focusTask && updateConfirmation &&
            <UpdateTaskNameForm 
                taskName={focusTask.taskName} 
                onSubmit={handleUpdateTaskName} 
                onClose={() => setUpdateConfirmation(false)}
            />
            }
            {focusTask && deleteConfirmation &&
            (<PopUpForm
                title={"Hapus Tugas"}
                message={'Apakah Anda yakin ingin menghapus tugas ini?'}
                wrapContent
            >
                <>
                <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteTask}>Hapus</Button>
                    <Button variant="secondary" onClick={() => setDeleteConfirmation(false)}
                    >Batal</Button>
                </div>
                </>
            </PopUpForm>)
            }
            {children}
        </TaskContext.Provider>
    )
}

export const useTaskData = () => useContext(TaskContext)