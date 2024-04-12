"use client"
import { useEffect, useState, memo } from "react"
import PopUp from "../../common/alert/PopUp"
import PopUpLoad from "../../common/alert/PopUpLoad"

import { BsThreeDots as DotIcon } from "react-icons/bs"
import { IoIosCloseCircle as CloseIcon } from "react-icons/io";

import { getTaskById } from "@/app/lib/fetch/task"

function TaskDetail({ taskId, open, closeFn }){
    const [task, setTask] = useState()

    useEffect(() => {
        if(taskId && open && (!task || task.id !== taskId)){
            getTaskById(taskId)
            .then(res => {
                if(res.data){
                    setTask(res.data)
                }
                else{
                    alert("Gagal mengambil data tugas")
                }
            })
        }
    }, [taskId, open, task])

    if(!task || task.id !== taskId) return(<PopUpLoad/>)

    if(open){
        return(
            <PopUp>
                <div className={`flex flex-col gap-4 md:gap-6 px-6 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                    <div className="flex items-center gap-4">
                        <div className={`text-lg md:text-2xl font-semibold text-dark-blue flex-grow`}>
                            {task.taskName}
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button className="p-1.5 hover:bg-gray-200 duration-200 transition-colors rounded-sm">
                                <DotIcon size={20}/>
                            </button>
                            <div onClick={closeFn}><CloseIcon size={32} className="text-basic-blue"/></div>
                        </div>
                    </div>
                </div>
            </PopUp>
        )
    }
}

export default memo(TaskDetail)