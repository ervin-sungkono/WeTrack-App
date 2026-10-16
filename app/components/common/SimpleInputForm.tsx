"use client"
import { useRef, type FormEventHandler, type MouseEventHandler, type KeyboardEvent } from "react"

type SimpleInputFormProps = {
    maxLength?: number
    name: string
    onSubmit: FormEventHandler<HTMLFormElement>
    onBlur?: MouseEventHandler<HTMLButtonElement>
    placeholder?: string
}

export default function SimpleInputForm({ maxLength = 99999, name, onSubmit, onBlur, placeholder }: SimpleInputFormProps){
    const buttonRef = useRef<HTMLButtonElement>(null)
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
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if(e.key === 'Enter'){
                        e.preventDefault()
                        buttonRef.current?.click()
                    }
                }}
                maxLength={maxLength}
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
