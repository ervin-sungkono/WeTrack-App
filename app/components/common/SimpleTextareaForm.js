"use client"
import { useRef } from "react"

export default function SimpleTextareaForm({ name, onSubmit, onBlur, placeholder, rows = 4, defaultValue }){
    const buttonRef = useRef()
    return(
        <form 
            id={`${name}-form`}
            action={"#"}
            onSubmit={onSubmit}
            className="w-full py-2.5 px-2 flex flex-col gap-2 items-start border border-basic-blue/60 rounded-md bg-white"
        >
            <textarea
                id={name}
                name={name} 
                rows={rows}
                onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                        buttonRef.current.click()
                    }
                }}
                autoFocus
                onFocus={(e) => (e.target.selectionStart = e.target.value.length)}
                autoComplete="off"
                placeholder={placeholder} 
                className="w-full text-xs md:text-sm border-none bg-slate-100 rounded focus:ring-0"
            >
                {defaultValue}
            </textarea>
            <div className="flex items-center gap-1 md:gap-2">
                <button ref={buttonRef} type="submit" className="text-xs md:text-sm font-semibold py-1.5 md:py-2 px-2.5 md:px-4 bg-basic-blue text-white rounded hover:bg-basic-blue/80 transition-colors duration-300">Simpan</button>
                <button onClick={onBlur} type="button" className="text-xs md:text-sm font-semibold py-1.5 md:py-2 px-2.5 md:px-4 bg-danger-red text-white rounded hover:bg-danger-red/80 transition-colors duration-300">Batal</button>
            </div>
        </form>
    )
}