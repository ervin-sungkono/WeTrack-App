"use client"
import { useState } from "react"
import PopUp from "../alert/PopUp"
import Button from "../button/Button"
import CustomTooltip from "../CustomTooltip"

import { pickTextColorBasedOnBgColor } from "@/app/lib/color"
import { FaPlus as PlusIcon } from "react-icons/fa"
import { 
    MdEdit as EditIcon,
    MdDelete as DeleteIcon 
} from "react-icons/md"

import EditLabelForm from "./EditLabelForm"

export default function LabelForm({ projectId, onCancel }){
    const [isCreatingLabel, setCreatingLabel] = useState(false)
    const [labelFocus, setLabelFocus] = useState()

    const labels = [  
        { id: "LB001", content:'apple', backgroundColor: '#ff0000' },
        { id: "LB002", content:'apple2', backgroundColor: '#0000ff' },
        { id: "LB003", content:'apple3', backgroundColor: '#ffff00' }
    ]

    const addLabel = ({ content, backgroundColor }) => {
        console.log(content, backgroundColor)
    }

    const updateLabel = ({ content, backgroundColor }) => {
        console.log(labelFocus, content, backgroundColor)
        setLabelFocus(null)
    }

    const deleteLabel = (id) => {
        console.log("delete: ", id)
    }

    return(
        <PopUp>
            <div className="w-full h-full flex justify-center items-center">
                <div className={`w-64 md:w-80 flex flex-col gap-4 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-semibold text-dark-blue uppercase">Label (maks 10)</div>
                        <div className="flex flex-col gap-1 mt-0.5 mb-2">
                            {labels.map(({id, content, backgroundColor}) => (
                                <div key={id}>
                                    {(id === labelFocus) ?
                                    <EditLabelForm
                                        defaultContent={content}
                                        defaultColor={backgroundColor}
                                        onCancel={() => setLabelFocus(null)}
                                        onSubmit={updateLabel}
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
                                                <button className="p-1.5 text-danger-red border border-danger-red rounded" onClick={() => deleteLabel(id)}>
                                                    <DeleteIcon size={16}/>
                                                </button>
                                            </CustomTooltip>
                                        </div>
                                    </div>}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            {isCreatingLabel ? 
                            <EditLabelForm
                                onCancel={() => setCreatingLabel(false)}
                                onSubmit={addLabel}
                            /> : 
                            <Button variant="primary" size="sm" onClick={() => setCreatingLabel(true)}>
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