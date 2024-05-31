"use client"

import { useEffect, useRef } from "react"
import { IoMdClose as CloseIcon } from "react-icons/io"

export default function SimpleDateForm({ name, value, onChange, onCancel, ...props }){
    const inputDateRef = useRef()

    useEffect(() => {
        if(inputDateRef.current) inputDateRef.current.showPicker()
    }, [inputDateRef])

    return(
        <div className="flex">
            <div className="flex flex-grow flex-col gap-2 items-end border border-basic-blue/60 rounded-md bg-white overflow-hidden">
                <input 
                    ref={inputDateRef}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    {...props}
                    type="date"
                    className="w-full text-xs md:text-sm border-none bg-slate-100 rounded focus:ring-0"
                />
            </div>
            <button className="flex-shrink-0 p-2 hover:text-danger-red transition-colors duration-300" onClick={onCancel}>
                <CloseIcon size={16}/>
            </button>  
        </div>
        
    )
}