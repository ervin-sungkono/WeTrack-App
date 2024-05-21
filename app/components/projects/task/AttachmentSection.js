"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { dateFormat } from "@/app/lib/date"
import DotButton from "../../common/button/DotButton"
import CustomTooltip from "../../common/CustomTooltip"
import PopUpLoad from "../../common/alert/PopUpLoad"
import PopUpForm from "../../common/alert/PopUpForm"
import Button from "../../common/button/Button"

import { FiPlus as PlusIcon } from "react-icons/fi"
import { FaFileAlt as FileIcon } from "react-icons/fa";
import { MdFileDownload as DownloadIcon, MdDelete as DeleteIcon } from "react-icons/md"
import { onSnapshot } from "firebase/firestore"
import { getQueryReference } from "@/app/firebase/util"
import { addAttachment, deleteAttachment } from "@/app/lib/fetch/attachment"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"

const Table = dynamic(() => import("../../common/table/Table"))

export default function AttachmentSection({ taskId }){
    const [uploading, setUploading] = useState(false)
    const [isDeleting, setDeleting] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [deleteMode, setDeleteMode] = useState(null)
    const [fileFocus, setFileFocus] = useState(null)
    const [attachmentData, setAttachmentData] = useState([])
    const role = useRole()

    const handleDeleteAttachment = async() => {
        // Tambahin popup Konfirmasi
        setDeleting(true)
        try{
            if(deleteMode === "single"){
                const res = await deleteAttachment({ taskId, attachmentId: fileFocus })

                if(!res.success){
                    alert("Gagal menghapus lampiran")
                }
            }else if(deleteMode === "all"){
                await Promise.all(attachmentData.map(attachment => {
                    return deleteAttachment({ taskId, attachmentId: attachment.id })
                }))
            } 
        }
        catch(e){
            console.log(e)
        }finally{
            setDeleteConfirmation(false)
            setDeleteMode(null)
            setFileFocus(null)
            setDeleting(false)
        }
    }

    const showDeleteConfirmation = (mode, id = null) => {
        setDeleteConfirmation(true)
        setDeleteMode(mode)

        if(mode === "single" && id) setFileFocus(id)
    }

    const attachmentsAction = [
        {
            label: "Unduh Semua",
            fnCall: async() => {
                const zip = new JSZip()
                
                await Promise.all(attachmentData.map(async(attachment) => {
                    const image = await fetch(attachment.attachmentStoragePath)
                        .then(res => res.blob())
                        .catch(e => console.log(e))

                    zip.file(attachment.originalFileName, image)
                }))

                zip.generateAsync({type: "blob"}).then(function(content) {
                    saveAs(content, `${taskId}_attachments.zip`);
                })
            }
        },
        {
            label: "Hapus Semua",
            fnCall: () => showDeleteConfirmation("all")
        }
    ]

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
                return <a href={attachmentLocation} target="_blank" className="break-words cursor-pointer text-xs md:text-sm text-basic-blue hover:underline">{attachmentName}</a>
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Tanggal diunggah',
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt")
                return <p className="text-xs md:text-sm">{dateFormat(createdAt.seconds, true)}</p>
            }
        }, 
        {
            accessorKey: 'attachmentStoragePath',
            header: "Pilihan",
            cell: ({ row }) => {
                const id = row.getValue("id")
                const filename = row.getValue("originalFileName")
                const attachmentLocation = row.getValue("attachmentStoragePath")
                return (
                    <div className="flex gap-1">
                        <CustomTooltip id={`download-file-${id}`} content={"Unduh Lampiran"}>
                            <button onClick={() => saveAs(attachmentLocation, filename)} className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                                <DownloadIcon size={20}/>
                            </button>
                        </CustomTooltip>
                        {validateUserRole({ userRole: role, minimumRole: 'Member' }) && 
                         <CustomTooltip id={`delete-file-${id}`} content={"Hapus Lampiran"}>
                            <button className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
                                <DeleteIcon className="text-danger-red" size={20} onClick={() => showDeleteConfirmation("single", id)}/>
                            </button>
                         </CustomTooltip>}
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
            setUploading(true)
            const imageSizePerFile = 2 * 1024 * 1024
            const files =  Array.from(fileInput.files).filter(file => file.size <= imageSizePerFile)
            
            for(const file of files){
                try{
                    const res = await addAttachment({ taskId: taskId, attachment: file })
                    if(!res.success) console.log(`Fail to upload file ${file.name}`)
                }catch(e){
                    console.log(`Fail to upload file ${file.name}`)
                    continue
                }
            }

            setUploading(false)
            fileInput.remove()
        }
        fileInput.click()
    }

    return(
        <div className="flex flex-col gap-1 md:gap-2">
            {(uploading || isDeleting) && <PopUpLoad/>}
            {deleteConfirmation && 
            <PopUpForm
                title={deleteMode === 'single' ? "Hapus Lampiran" : "Hapus Semua Lampiran"}
                titleSize="large"
                message={deleteMode === 'single' ? 'Apakah Anda yakin ingin menghapus lampiran ini?' : 'Apakah Anda yakin ingin menghapus semua lampiran dalam tugas ini?'}
                wrapContent
            >
                <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteAttachment}>Hapus</Button>
                    <Button variant="secondary" onClick={() => {setDeleteConfirmation(false)}}>Batal</Button>
                </div>
            </PopUpForm>}
            <div className="flex items-center">
                <div className="flex flex-grow flex-col gap-1">
                    <p className="font-semibold text-xs md:text-sm text-dark-blue">Lampiran <span>({attachmentData.length})</span> <span className="text-[10.8px] md:text-xs">maksimal 10</span></p>
                    <p className="text-[10.8px] md:text-xs text-dark-blue/80">Batas ukuran dari satu lampiran adalah 2MB.</p>
                </div>
                {validateUserRole({ userRole: role, minimumRole: 'Member' }) && 
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
                </div>}
            </div>
            {attachmentData.length > 0 ? 
            <div className="max-h-[400px] overflow-y-auto">
                <Table
                    data={attachmentData}
                    columns={columns}
                    usePagination={false}
                />
            </div>
             :
            <div className="flex flex-col items-center gap-2 py-8">
                <FileIcon size={48} className="text-dark-blue/60"/>
                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada lampiran yang diunggah.</p>
            </div>}
        </div>
    )
}