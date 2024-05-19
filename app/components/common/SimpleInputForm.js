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
                onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                        buttonRef.current.click()
                    }
                }}
                autoFocus
                autoComplete="off"
                placeholder={placeholder} 
                className="w-full text-xs md:text-sm border-none bg-slate-100 rounded focus:ring-0"
            />
            <div className="flex items-center gap-1 md:gap-2">
                <button onClick={onBlur} type="button" className="text-xs font-semibold py-1.5 px-2.5 bg-danger-red text-white rounded hover:bg-danger-red/80 transition-colors duration-300">Batal</button>
                <button ref={buttonRef} type="submit" className="text-xs font-semibold py-1.5 px-2.5 bg-basic-blue text-white rounded hover:bg-basic-blue/80 transition-colors duration-300">Buat</button>
            </div>
        </form>
    )
}