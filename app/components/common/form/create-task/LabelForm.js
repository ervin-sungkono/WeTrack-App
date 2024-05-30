"use client"
import { useState } from "react"
import PopUp from "../../alert/PopUp"
import Button from "../../button/Button"
import CustomTooltip from "../../CustomTooltip"
import EditLabelForm from "./EditLabelForm"
import PopUpLoad from "../../alert/PopUpLoad"
import PopUpForm from "../../alert/PopUpForm"

import { addLabel, updateLabel, deleteLabel } from "@/app/lib/fetch/label"
import { pickTextColorBasedOnBgColor } from "@/app/lib/color"

import { FaPlus as PlusIcon } from "react-icons/fa"
import { 
    MdEdit as EditIcon,
    MdDelete as DeleteIcon 
} from "react-icons/md"

export default function LabelForm({ labelData, projectId, onCancel }){
    const [isCreatingLabel, setCreatingLabel] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [labelFocus, setLabelFocus] = useState()
    const [deleteFocus, setDeleteFocus] = useState()
    const [loading, setLoading] = useState(false)

    const handleAddLabel = async({ content, backgroundColor }) => {
        try{
            setLoading(true)
            const res = await addLabel({ content, backgroundColor, projectId })

            if(!res.success){
                alert("Gagal menambahkan label baru")
                console.log(res.message)
            }
        }catch(e){
            console.log(e)
        }finally{
            setCreatingLabel(false)
            setLoading(false)
        }
    }

    const handleUpdateLabel = async({ content, backgroundColor }) => {
        try{
            setLoading(true)
            const res = await updateLabel({ content, backgroundColor, projectId, labelId: labelFocus })

            if(!res.success){
                alert("Gagal mengubah label")
                console.log(res.message)
            }else{
                setLabelFocus(null)
            }
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }

    const showLabelDeleteConfirmation = (id) => {
        setDeleteFocus(id)
        setDeleteConfirmation(true)
    }

    const hideLabelDeleteConfirmation = () => {
        setDeleteFocus(null)
        setDeleteConfirmation(false)
    }

    const handleDeleteLabel = async() => {
        try{
            setLoading(true)
            const res = await deleteLabel({ projectId, labelId: deleteFocus })

            if(!res.success){
                alert("Gagal menghapus label")
                console.log(res.message)
            }
            else{
                setDeleteFocus(null)
            }
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }

    return(
        <PopUp>
            <div className="w-full h-full flex justify-center items-center">
                {loading && <PopUpLoad/>}
                {deleteConfirmation && 
                <PopUpForm
                    title={"Hapus Label"}
                    message={'Apakah Anda yakin ingin menghapus label ini?'}
                    wrapContent
                >
                    <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                        <Button variant="danger" onClick={handleDeleteLabel}>Hapus</Button>
                        <Button variant="secondary" onClick={hideLabelDeleteConfirmation}>Batal</Button>
                    </div>
                </PopUpForm>}
                <div className={`w-64 md:w-80 flex flex-col gap-4 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-semibold text-dark-blue uppercase">Label (maksimal 10)</div>
                        {labelData.length > 0 ? <div className="flex flex-col gap-1 mt-0.5 mb-2">
                            {labelData.map(({id, content, backgroundColor}) => (
                                <div key={id}>
                                    {(id === labelFocus) ?
                                    <EditLabelForm
                                        action="edit"
                                        defaultContent={content}
                                        defaultColor={backgroundColor}
                                        onCancel={() => setLabelFocus(null)}
                                        onSubmit={handleUpdateLabel}
                                    /> :
                                    <div className="flex items-center gap-2">
                                        <div  className="flex flex-grow h-8 items-center rounded-full px-3" style={{background: backgroundColor}}>
                                            <p className="text-sm leading-none font-medium" style={{color: pickTextColorBasedOnBgColor(backgroundColor)}}>{content}</p>
                                        </div>
                                        <div className="flex flex-shrink-0 gap-1">
                                            <CustomTooltip id={`edit-label-${id}`} content={"Ubah Label"}>
                                                <button className="p-1.5 text-basic-blue border border-basic-blue rounded" onClick={() => setLabelFocus(id)}>
                                                    <EditIcon size={16}/>
                                                </button>
                                            </CustomTooltip>
                                            <CustomTooltip id={`delete-label-${id}`} content={"Hapus Label"}>
                                                <button className="p-1.5 text-danger-red border border-danger-red rounded" onClick={() => showLabelDeleteConfirmation(id)}>
                                                    <DeleteIcon size={16}/>
                                                </button>
                                            </CustomTooltip>
                                        </div>
                                    </div>}
                                </div>
                            ))}
                        </div> :
                        <div className="text-xs md:text-sm py-4">Belum ada label yang dibuat..</div>}
                        <div className="flex flex-col gap-2">
                            {isCreatingLabel ? 
                            <EditLabelForm
                                onCancel={() => setCreatingLabel(false)}
                                onSubmit={handleAddLabel}
                            /> : 
                            <Button disabled={labelData.length >= 10} variant="primary" size="sm" onClick={() => setCreatingLabel(true)}>
                                <div className="flex justify-center items-center gap-2">
                                    <PlusIcon size={16}/>
                                    <p>Buat Label</p>
                                </div>
                            </Button>}
                            <Button size="sm" variant="secondary" onClick={onCancel}>
                                Kembali
                            </Button>
                        </div>    
                    </div>      
                </div>
            </div>
        </PopUp>
    )
}