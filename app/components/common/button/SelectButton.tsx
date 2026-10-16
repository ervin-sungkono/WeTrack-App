"use client"
import { useEffect, useState, useRef } from "react"
import { initDropdowns } from "flowbite"

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'
import type { SelectOption } from "@/app/types/ui"

type SelectButtonProps<Value extends string | number | null> = {
    name: string
    placeholder?: string | number
    defaultValue?: SelectOption<Value>
    options?: SelectOption<Value>[]
    onChange?: (value: Value) => void
    disabled?: boolean
    buttonClass?: string
    reset?: boolean
}

export default function SelectButton<Value extends string | number | null>({ name, placeholder, defaultValue, options = [], onChange, disabled, buttonClass, reset = false }: SelectButtonProps<Value>){
    const [selectionState, setSelectionState] = useState(() => ({
        defaultValue,
        reset,
        selected: reset ? options[0] : defaultValue ?? options[0],
    }))
    const selected = selectionState.defaultValue === defaultValue && selectionState.reset === reset
        ? selectionState.selected
        : reset ? options[0] : defaultValue ?? options[0]
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        initDropdowns()
    }, [])

    const handleSelectedUpdate = ({label, value}: SelectOption<Value>) => {
        buttonRef.current?.click()
        setSelectionState({ defaultValue, reset, selected: {label, value} })
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
                className={`flex max-w-[160px] items-center gap-1 font-semibold text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full focus:ring-0 focus:outline-none border transition-colors duration-300 ease-in-out ${buttonClass ?? 'text-dark-blue hover:text-basic-blue border-dark-blue/30'}`}
                type="button"
            >
                <p className="truncate whitespace-nowrap">{selected?.label ?? placeholder} </p>
                {/* <DropdownIcon size={16}/> */}
                {!disabled && <DropdownIcon size={16}/>}
            </button>

            <div id={name} className={`z-[100] hidden bg-white divide-y divide-gray-100 rounded-lg border border-dark-blue/30 min-w-40 max-h-48 overflow-y-auto`}>
            {!disabled &&
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    {options.map(({label, value}) => (
                        <li key={value}>
                            <button
                                disabled={selected?.label === label}
                                onClick={!disabled ? () => handleSelectedUpdate({label, value}) : undefined} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
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
