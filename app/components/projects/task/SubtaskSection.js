import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { dateFormat } from "@/app/lib/date"
import CustomTooltip from "../../common/CustomTooltip"
import UserSelectButton from "../../common/UserSelectButton"
import SelectButton from "../../common/button/SelectButton"

import { FiPlus as PlusIcon } from "react-icons/fi"
import { FaTasks as TaskIcon } from "react-icons/fa";
import { getPriority } from "@/app/lib/string"
import { getQueryReference } from "@/app/firebase/util"
import { onSnapshot } from "firebase/firestore"

const Table = dynamic(() => import("../../common/table/Table"))

export default function SubtaskSection({ taskId }){
    const [subtaskData, setSubtaskData] = useState([])

    const updateAssignee = (value) => {
        console.log(value)
    }

    useEffect(() => {
        if(!taskId) return

        const reference = getQueryReference({ collectionName: 'tasks', field: 'parentId', id: taskId })
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const updatedSubTask = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setSubtaskData(updatedSubTask)
        })

        return () => unsubscribe()
    }, [taskId])

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'taskName',
            header: 'Nama',
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => {
                const priorityIndex = row.getValue("priority")
                const priority = getPriority(priorityIndex)
                return <p className="text-xs md:text-sm">{priority}</p>
            }
        }, 
        {
            accessorKey: 'assignedTo',
            header: "Penerima",
            cell: ({ row }) => {
                const id = row.getValue('id')
                const assignedTo = row.getValue("assignedTo")
                // tambah logic untuk get user
                const user = {
                    fullName: "Ervin CS",
                    profileImage: null
                }
                return (
                    <UserSelectButton 
                        name={`assignee-${id}`}
                        type="button"
                        placeholder={user}
                        options={[]}
                        onChange={updateAssignee}
                    />
                )
            },
        },
        {
            accessorKey: 'statusId',
            header: "Status",
            cell: ({ row }) => {
                const id = row.getValue("id")
                const statusId = row.getValue("statusId")
                // tambah logic untuk get user

                return (
                    <SelectButton 
                        name={`status-${id}`}
                        defaultValue={"Todo"}
                        options={[]}
                        onChange={(value) => console.log(value)}
                        buttonClass="border-none"
                    />
                )
            },
        },
    ]

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center">
                <p className="font-semibold text-xs md:text-sm flex-grow">Subtugas <span>({subtaskData.length})</span></p>
                <div className="flex gap-1">
                    <CustomTooltip id="subtask-tooltip" content={"Tambah Subtugas"}>
                        <button
                            onClick={null}
                            className={`p-2 hover:bg-gray-200 duration-200 transition-colors rounded`}
                        >
                            <PlusIcon size={16}/>
                        </button>
                    </CustomTooltip>
                </div>
            </div>
            {subtaskData.length > 0 ? 
            <>
                <div className="w-full flex items-center gap-2">
                    <div className="flex-grow h-2 bg-gray-200 rounded-full">
                        <div className="bg-basic-blue h-full rounded-full" style={{width: '50%'}}></div>
                    </div>
                    <p className="text-xs md:text-sm">50% Selesai</p>
                </div>
                <Table
                    data={subtaskData}
                    columns={columns}
                    usePagination={false}
                />
            </>
            :
            <div className="flex flex-col items-center gap-2 py-8">
                <TaskIcon size={48} className="text-dark-blue/60"/>
                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada subtugas yang ditambahkan.</p>
            </div>}
        </div>
    )
}