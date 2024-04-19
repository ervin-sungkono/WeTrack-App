"use client"
import { useEffect, useState, memo } from "react"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import PopUp from "../../common/alert/PopUp"
import PopUpLoad from "../../common/alert/PopUpLoad"
import Label from "../../common/Label"
import UserSelectButton from "../../common/UserSelectButton"

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";

import { getTaskById } from "@/app/lib/fetch/task"
import { getPriority } from "@/app/lib/string"
import { dateFormat } from "@/app/lib/date"
import DotButton from "../../common/button/DotButton"

const AttachmentSection = dynamic(() => import("./AttachmentSection"))
const SubtaskSection = dynamic(() => import("./SubtaskSection"))

function TaskDetail({ taskId, open, closeFn }){
    const [task, setTask] = useState()
    const [assignee, setAssignee] = useState()
    const { data: session } = useSession()

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

    const attachmentList = [
        { 
            id: 'A1023',
            attachmentName: "AIPoweredAssistance.png",
            attachmentLocation: "http://localhost:3000/AIPoweredAssistance.png",
            createdAt: new Date().toISOString(),
        },
        { 
            id: 'A1024',
            attachmentName: "CompletedState.png",
            attachmentLocation: "http://localhost:3000/CompletedState.png",
            createdAt: new Date("04-16-2024").toISOString(),
        }
    ]

    const subtasks = [
        { 
            id: 'ST1023',
            taskName: 'Develop Initial UI',
            priority: 3,
            statusId: "SI232",
        },
        { 
            id: 'ST1024',
            taskName: 'Add Animation',
            priority: 2,
            statusId: "SI233",
        }
    ]


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
                <div className={`h-full flex flex-col gap-4 md:gap-6 px-6 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg overflow-y-auto`}>
                    <div className="flex items-start gap-4">
                        <div className={`text-lg md:text-2xl font-semibold text-dark-blue flex-grow`}>
                            {task.taskName}
                        </div>
                        <div className="flex items-center gap-2.5">
                            <DotButton name={`task-detail-${taskId}`}/>
                            <button onClick={closeFn}><CloseIcon size={32} className="text-basic-blue"/></button>
                        </div>
                    </div>
                    <div className="h-full flex flex-col overflow-y-auto gap-4 md:gap-6 pr-2 -mr-2 custom-scrollbar">
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-3 gap-2">
                                <p className="font-semibold text-xs md:text-sm">Penerima</p>
                                <div className="col-span-2">
                                    <UserSelectButton 
                                        name={"assignedTo"}
                                        type="button"
                                        userId={session.user.uid}
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
                            <AttachmentSection attachments={attachmentList}/>
                            <SubtaskSection subtasks={subtasks}/>
                        </div>
                    </div>
                    
                </div>
            </PopUp>
        )
    }
}

export default memo(TaskDetail)