"use client"

import { useEffect, useRef, type InputHTMLAttributes } from "react"
import { IoMdClose as CloseIcon } from "react-icons/io"

type SimpleDateFormProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange" | "type"> & {
    name: string
    value: string
    onChange: NonNullable<InputHTMLAttributes<HTMLInputElement>["onChange"]>
    onCancel: () => void
}

export default function SimpleDateForm({ name, value, onChange, onCancel, ...props }: SimpleDateFormProps){
    const inputDateRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        try {
            inputDateRef.current?.showPicker()
        } catch {
            // Browsers can reject showPicker when the input is not opened from a user gesture.
        }
    }, [])

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
            <button type="button" className="flex-shrink-0 p-2 hover:text-danger-red transition-colors duration-300" onClick={onCancel}>
                <CloseIcon size={16}/>
            </button>
        </div>

    )
}
