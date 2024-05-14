import dynamic from "next/dynamic"
import { dateFormat } from "@/app/lib/date"
import CustomTooltip from "../../common/CustomTooltip"
import UserSelectButton from "../../common/UserSelectButton"
import SelectButton from "../../common/button/SelectButton"

import { FiPlus as PlusIcon } from "react-icons/fi"
import { getPriority } from "@/app/lib/string"

const Table = dynamic(() => import("../../common/table/Table"))

export default function SubtaskSection({ taskId }){
    const updateAssignee = (value) => {
        console.log(value)
    }

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
                <p className="font-semibold text-xs md:text-sm flex-grow">Subtugas <span>({subtasks.length})</span></p>
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
            <div className="w-full flex items-center gap-2">
                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                    <div className="bg-basic-blue h-full rounded-full" style={{width: '50%'}}></div>
                </div>
                <p className="text-xs md:text-sm">50% Selesai</p>
            </div>
            {subtasks.length > 0 ? 
            <Table
                data={subtasks}
                columns={columns}
                usePagination={false}
            /> :
            <p className="text-xs md:text-sm">Belum ada subtugas yang ditambahkan.</p>}
        </div>
    )
}