"use client"
import { useEffect, useState, useRef } from "react"
import { initDropdowns } from "flowbite"

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'
import type { SelectOption } from "@/app/types/ui"

type ParentSelectButtonProps<Value extends string | number | null> = {
    name: string
    defaultValue?: SelectOption<Value>
    options?: SelectOption<Value>[]
    onChange?: (value: Value) => void
    disabled?: boolean
}

export default function ParentSelectButton<Value extends string | number | null>({ name, defaultValue, options = [], onChange, disabled }: ParentSelectButtonProps<Value>){
    const fallback = { label: "Belum Ada", value: null }
    const [selectionState, setSelectionState] = useState(() => ({ defaultValue, selected: defaultValue ?? fallback }))
    const selected = selectionState.defaultValue === defaultValue ? selectionState.selected : defaultValue ?? fallback
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        initDropdowns()
    }, [])

    const handleSelectedUpdate = ({label, value}: SelectOption<Value>) => {
        buttonRef.current?.click()
        setSelectionState({ defaultValue, selected: {label, value} })
        if(typeof onChange == "function") onChange(value)
    }

    return(
        <div>
            <button
                ref={buttonRef}
                data-dropdown-toggle={name}
                data-dropdown-placement="bottom-start"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="4"
                disabled={disabled}
                className="w-full flex gap-2 cursor-pointer text-dark-blue/80  hover:bg-gray-200 p-2 rounded transition-colors duration-300"
                type="button"
            >
                <p className="text-start text-xs md:text-sm font-semibold flex-grow whitespace-nowrap truncate">{selected?.label}</p>
                <DropdownIcon size={16}/>
            </button>

            <div id={name} className={`z-[100] hidden bg-white divide-y divide-gray-100 rounded-lg border border-dark-blue/30 w-full max-w-60 max-h-48 overflow-y-auto`}>
            {!disabled &&
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    {options.map(({label, value}) => (
                        <li key={value}>
                            <button
                                disabled={selected?.label === label}
                                onClick={!disabled ? () => handleSelectedUpdate({label, value}) : undefined} className="block w-full text-start px-4 py-2 font-semibold disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>}
            </div>
        </div>
    )
}
