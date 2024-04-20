"use client"
import dynamic from "next/dynamic"
import { useRef } from "react"
import { dateFormat } from "@/app/lib/date"
import DotButton from "../../common/button/DotButton"
import CustomTooltip from "../../common/CustomTooltip"

const Table = dynamic(() => import("../../common/table/Table"))

import { FiPlus as PlusIcon } from "react-icons/fi"
import { MdFileDownload as DownloadIcon, MdDelete as DeleteIcon } from "react-icons/md"


export default function AttachmentSection({ attachments = [] }){
    const attachmentUploaderRef = useRef()
    const attachmentsAction = [
        {
            label: "Unduh Semua",
            fnCall: () => {
                console.log("download all")
            }
        },
        {
            label: "Hapus Semua",
            fnCall: () => {
                console.log("delete all")
            }
        }
    ]

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'attachmentName',
            header: 'Nama',
            cell: ({ row }) => {
                const id = row.getValue("id")
                const attachmentName = row.getValue("attachmentName")
                const attachmentLocation = attachments.find(attachment => attachment.id === id).attachmentLocation
                return <a href={attachmentLocation} target="_blank" className="cursor-pointer text-xs md:text-sm text-basic-blue hover:underline">{attachmentName}</a>
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Tanggal diunggah',
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt")
                return <p className="text-xs md:text-sm">{dateFormat(createdAt, true)}</p>
            }
        }, 
        {
            accessorKey: 'action',
            header: "",
            cell: ({ row }) => {
                const id = row.getValue("id")
                const attachmentLocation = attachments.find(attachment => attachment.id === id).attachmentLocation
                return (
                    <div className="flex gap-1">
                        <a href={attachmentLocation} download className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                            <DownloadIcon size={20}/>
                        </a>
                        <button className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                            <DeleteIcon className="text-danger-red" size={20} onClick={() => console.log("deleting attachment-" + id)}/>
                        </button>
                    </div>
                )
            },
            enableSorting: false,
            size: 70
        },
    ]

    const openAttachmentUpload = () => {
        attachmentUploaderRef.current.click()
    }

    const handleAttachmentUpload = (e) => {
        console.log(e.target.files)
    }

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center">
                <p className="font-semibold text-xs md:text-sm flex-grow">Lampiran <span>({attachments.length})</span></p>
                <div className="flex gap-1">
                    <DotButton name={"attachments"} actions={attachmentsAction}/>
                    <CustomTooltip id="attachment-tooltip" content={"Tambah Lampiran"}>
                        <button 
                            onClick={openAttachmentUpload}
                            className={`p-2 hover:bg-gray-200 duration-200 transition-colors rounded`}
                        >
                            <PlusIcon size={16}/>
                        </button>
                    </CustomTooltip>
                    <input 
                        multiple 
                        hidden
                        ref={attachmentUploaderRef}  
                        onChange={handleAttachmentUpload}
                        type="file" 
                        accept="image/*,audio/*,video/*,.ppt,.pptx,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
                    />
                </div>
            </div>
            {attachments.length > 0 ? 
            <Table
                data={attachments}
                columns={columns}
                usePagination={false}
            /> :
            <p className="text-xs md:text-sm">Belum ada lampiran yang diunggah.</p>}
        </div>
    )
}