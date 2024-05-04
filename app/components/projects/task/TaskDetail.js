"use client"
import { useEffect, useState, memo } from "react"
import dynamic from "next/dynamic"
import Label from "../../common/Label"
import UserSelectButton from "../../common/UserSelectButton"

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";

import { getTaskById } from "@/app/lib/fetch/task"
import { getPriority } from "@/app/lib/string"
import { dateFormat } from "@/app/lib/date"
import DotButton from "../../common/button/DotButton"
import ActivitySection from "./ActivitySection"
import { TailSpin } from "react-loader-spinner"
import ChatSection from "./ChatSection"

const AttachmentSection = dynamic(() => import("./AttachmentSection"))
const SubtaskSection = dynamic(() => import("./SubtaskSection"))

function TaskDetail({ taskId, closeFn }){
    const [task, setTask] = useState()
    const [loading, setLoading] = useState(false)
    const [assignee, setAssignee] = useState()

    const userList = [
        {
            user: {
                id: "WeEzNxSREEdyDpSXkIYCAyA4E8y1",
                fullName: "Ervin Cahyadinata Sungkono",
                profileImage: null
            }
        },
        {
            user: {
                id: "02",
                fullName: "Kenneth Nathanael",
                profileImage: null
            }
        },
        {
            user: {
                id: "03",
                fullName: "Christopher Vinantius",
                profileImage: null
            }
        }
    ]

    useEffect(() => {
        if(taskId && (!task || (task && task.id !== taskId))){
            setLoading(true)
            getTaskById(taskId)
            .then(res => {
                if(res.data){
                    setTask(res.data)
                }
                setLoading(false)
            })
        }
    }, [taskId, task])

    if(loading) return(
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
            <TailSpin 
                color="#47389F"
                height={100}
                width={100}
            />
            <p className="text-sm md:text-base">Memuat data tugas..</p>
        </div>
    )

    if(!task){
        return (
            <div className="w-full h-full flex justify-center items-center">
                <p className="text-sm md:text-base text-dark-blue/80">Tugas tidak dapat ditemukan..</p>
            </div>
        )
    }

    return(
        <div className={`w-full h-full flex flex-col gap-3 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg overflow-y-auto`}>
            <div className="flex items-start gap-4">
                <div className={`text-lg md:text-2xl font-semibold text-dark-blue flex-grow`}>
                    {task.taskName}
                </div>
                <div className="flex items-center gap-2.5">
                    <DotButton name={`task-detail-${taskId}`}/>
                    {closeFn && <button onClick={closeFn}><CloseIcon size={32} className="text-basic-blue"/></button>}
                </div>
            </div>
            <div className="h-full flex flex-col overflow-y-auto gap-4 md:gap-6 pr-4 -mr-4 md:pr-8 md:-mr-8 custom-scrollbar">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                        <p className="font-semibold text-xs md:text-sm">Penerima</p>
                        <div className="col-span-2">
                            <UserSelectButton 
                                name={"assignedTo"}
                                type="button"
                                placeholder={task.assignedTo}
                                options={userList}
                                onChange={(value) => setAssignee(value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Penanda</p>
                        <div className="flex flex-wrap gap-2">
                            <Label text={"test-label"}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Tanggal Mulai</p>
                        <p>{dateFormat(task.startDate) ?? "Belum diatur"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Tenggat Waktu</p>
                        <p>{dateFormat(task.dueDate) ?? "Belum diatur"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold">Prioritas</p>
                        <p>{getPriority(task.priority)}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-xs md:text-sm">Deskripsi Tugas</p>
                        {task.description ? 
                        <p className="text-xs md:text-sm">{task.description}</p> :
                        <p>Tambahkan deskripsi tugas..</p>}
                    </div>
                    <ChatSection taskId={taskId} title={task.taskName}/>
                    <AttachmentSection taskId={taskId}/>
                    <SubtaskSection taskId={taskId}/>
                    <ActivitySection taskId={taskId}/>
                </div>
            </div>
        </div>
    )
}

export default memo(TaskDetail)