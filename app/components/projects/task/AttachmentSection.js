"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { dateFormat } from "@/app/lib/date"
import DotButton from "../../common/button/DotButton"
import CustomTooltip from "../../common/CustomTooltip"


import { FiPlus as PlusIcon } from "react-icons/fi"
import { FaFileAlt as FileIcon } from "react-icons/fa";
import { MdFileDownload as DownloadIcon, MdDelete as DeleteIcon } from "react-icons/md"
import { onSnapshot } from "firebase/firestore"
import { getQueryReference } from "@/app/firebase/util"
import { addAttachment, deleteAttachment } from "@/app/lib/fetch/attachment"
import { saveAs } from "file-saver"

const Table = dynamic(() => import("../../common/table/Table"))

export default function AttachmentSection({ taskId }){
    const attachmentsAction = [
        {
            label: "Unduh Semua",
            fnCall: () => {
                console.log("download all")
            }
        },
        {
            label: "Hapus Semua",
            fnCall: async() => {
                // Tambahin popup konfirmasi
                await Promise.all(attachmentData.map(attachment => {
                    return deleteAttachment({ taskId, attachmentId: attachment.id })
                }))
            }
        }
    ]
    const [attachmentData, setAttachmentData] = useState([])
    const handleDeleteAttachment = async(attachmentId) => {
        // Tambahin popup Konfirmasi
        const res = await deleteAttachment({ taskId, attachmentId })

        if(!res.success){
            alert("Gagal menghapus lampiran")
        }
    }

    useEffect(() => {
        if(!taskId) return

        const reference = getQueryReference({ collectionName: "attachments", field: "taskId", id: taskId })
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const updatedAttachments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setAttachmentData(updatedAttachments)
        })

        return () => unsubscribe()
    }, [taskId])

    const columns = [
        {
            accessorKey: 'id',
        },
        {
            accessorKey: 'originalFileName',
            header: 'Nama',
            cell: ({ row }) => {
                const attachmentName = row.getValue("originalFileName")
                const attachmentLocation = row.getValue("attachmentStoragePath")
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
            accessorKey: 'attachmentStoragePath',
            header: "",
            cell: ({ row }) => {
                const id = row.getValue("id")
                const filename = row.getValue("originalFileName")
                const attachmentLocation = row.getValue("attachmentStoragePath")
                return (
                    <div className="flex gap-1">
                        <button onClick={() => saveAs(attachmentLocation, filename)} className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                            <DownloadIcon size={20}/>
                        </button>
                        <button className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                            <DeleteIcon className="text-danger-red" size={20} onClick={() => handleDeleteAttachment(id)}/>
                        </button>
                    </div>
                )
            },
            enableSorting: false,
            size: 70
        },
    ]

    const openAttachmentUpload = () => {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = 'image/*,audio/*,video/*,.ppt,.pptx,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json'
        fileInput.multiple = true
        fileInput.formEnctype = "multipart/form-data"
        fileInput.onchange = async() => {
            const files =  Array.from(fileInput.files)

            const imageSizePerFile = 2 * 1024 * 1024
            for(let i = 0; i < files.length; i++){
                if(files[i].size > imageSizePerFile){
                    alert("Lampiran tidak boleh melebihi 2MB")
                    return
                }
            }
            
            const res = await addAttachment({ taskId: taskId, attachments: files })

            if(!res.success){
                alert("Gagal menambahkan lampiran")
            }
            fileInput.remove()
        }
        fileInput.click()
    }

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center">
                <div className="flex flex-grow flex-col gap-1">
                    <p className="font-semibold text-xs md:text-sm text-dark-blue">Lampiran <span>({attachmentData.length})</span> <span className="text-[10.8px] md:text-xs">maks 10</span></p>
                    <p className="text-[10.8px] md:text-xs text-dark-blue/80">*Batas ukuran lampiran adalah 2MB</p>
                </div>
                <div className="flex gap-1">
                    <DotButton name={"attachments-action"} actions={attachmentsAction}/>
                    <CustomTooltip id="attachment-tooltip" content={"Tambah Lampiran"}>
                        <button 
                            onClick={openAttachmentUpload}
                            className={`p-2 hover:bg-gray-200 duration-200 transition-colors rounded`}
                        >
                            <PlusIcon size={16}/>
                        </button>
                    </CustomTooltip>
                </div>
            </div>
            {attachmentData.length > 0 ? 
            <Table
                data={attachmentData}
                columns={columns}
                usePagination={false}
            /> :
            <div className="flex flex-col items-center gap-2 py-8">
                <FileIcon size={48} className="text-dark-blue/60"/>
                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada lampiran yang diunggah.</p>
            </div>}
        </div>
    )
}