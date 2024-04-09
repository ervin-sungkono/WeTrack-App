"use client"
import { useRef } from "react"

export default function SimpleInputForm({ name, onSubmit, onBlur, placeholder }){
    const buttonRef = useRef()
    return(
        <form 
            id={`${name}-form`}
            action={"#"}
            onSubmit={onSubmit} 
            className="py-2.5 px-3 flex flex-col gap-2 items-end border border-basic-blue/60 rounded-md bg-white"
        >
            <input 
                id={name}
                name={name} 
                type="text" 
                onBlur={onBlur} 
                onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                        buttonRef.current.click()
                    }
                }}
                autoFocus
                placeholder={placeholder} 
                className="w-full text-xs md:text-sm border-none bg-slate-100 rounded-sm focus:ring-0"
            />
            <button ref={buttonRef} type="submit" hidden/>
        </form>
    )
}