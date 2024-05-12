"use client"
import { useState } from "react"
import CustomTooltip from "../CustomTooltip"
import { getRandomColor, pickTextColorBasedOnBgColor } from "@/app/lib/color"

import { 
    IoMdCheckmark as CheckIcon,
    IoMdClose as CloseIcon
} from "react-icons/io"

export default function EditLabelForm({ defaultContent, defaultColor, onCancel, onSubmit }){
    const [content, setContent] = useState(defaultContent)
    const [submitting, setSubmitting] = useState(false)
    const [backgroundColor, setBackgroundColor] = useState(defaultColor ?? getRandomColor())

    return(
        <div className="flex items-center gap-2">
            <form className="flex items-center gap-1">
                <input 
                    name="content" 
                    type="text" 
                    className="text-sm w-full h-8 rounded-full border-none" 
                    style={{backgroundColor: backgroundColor, color: pickTextColorBasedOnBgColor(backgroundColor)}}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input 
                    name="backgroundColor"
                    className="w-8 h-8 flex-shrink-0 cursor-pointer" 
                    type="color" 
                    value={backgroundColor} 
                    onChange={(e) => setBackgroundColor(e.target.value)}
                />
            </form>
            <div className="flex flex-shrink-0 gap-1">
                <CustomTooltip id={`accept-btn`} content={"Batalkan"}>
                    <button className="p-1.5 text-white bg-danger-red border border-danger-red rounded" onClick={onCancel}>
                        <CloseIcon size={16}/>
                    </button>
                </CustomTooltip>
                <CustomTooltip id={`cancel-btn`} content={"Tambah Label"}>
                    <button 
                        disabled={submitting} 
                        className="p-1.5 text-white bg-basic-blue border border-basic-blue rounded disabled:bg-gray-400 disabled:border-gray-400" 
                        onClick={async(e) => {
                            setSubmitting(true)
                            await onSubmit({content, backgroundColor})
                            setSubmitting(false)
                        }}
                    >
                        <CheckIcon size={16}/>
                    </button>
                </CustomTooltip>
            </div>
        </div>
    )
}