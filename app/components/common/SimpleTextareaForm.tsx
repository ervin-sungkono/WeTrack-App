"use client"
import { useRef, useState, type FormEventHandler, type MouseEventHandler, type KeyboardEvent, type FocusEvent, type ChangeEvent } from "react"

type SimpleTextareaFormProps = {
    name: string
    onSubmit: FormEventHandler<HTMLFormElement>
    onBlur?: MouseEventHandler<HTMLButtonElement>
    placeholder?: string
    rows?: number
    defaultValue?: string
    max?: number | null
}

export default function SimpleTextareaForm({ name, onSubmit, onBlur, placeholder, rows = 4, defaultValue, max = null }: SimpleTextareaFormProps){
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [textLength, setTextLength] = useState(0)

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
                maxLength={max ?? undefined}
                defaultValue={defaultValue}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                    if(e.key === 'Enter'){
                        e.preventDefault()
                        buttonRef.current?.click()
                    }
                }}
                autoFocus
                onFocus={(e: FocusEvent<HTMLTextAreaElement>) => (e.target.selectionStart = e.target.value.length)}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextLength(e.target.value.trim().length)}
                autoComplete="off"
                placeholder={placeholder}
                className="w-full text-xs md:text-sm border-none bg-slate-100 rounded focus:ring-0"
            />
            <div className="w-full flex items-start">
                <div className="flex items-center gap-1 md:gap-2">
                    <button ref={buttonRef} type="submit" className="text-xs md:text-sm font-semibold py-1.5 md:py-2 px-2.5 md:px-4 bg-basic-blue text-white rounded hover:bg-basic-blue/80 transition-colors duration-300">Simpan</button>
                    <button onClick={onBlur} type="button" className="text-xs md:text-sm font-semibold py-1.5 md:py-2 px-2.5 md:px-4 bg-danger-red text-white rounded hover:bg-danger-red/80 transition-colors duration-300">Batal</button>
                </div>
                <div className={`flex ml-auto items-center gap-1 text-xs ${(max !== null && textLength > max) ? "text-red-600" : "text-dark-blue/80"}`}>
                    <p>{textLength}</p>
                    <p>/</p>
                    <p>{max ?? "—"}</p>
                </div>
            </div>

        </form>
    )
}
