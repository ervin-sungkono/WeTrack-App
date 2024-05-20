"use client"
import { useEffect, useState, useRef } from "react"
import { initDropdowns } from "flowbite"

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'

export default function ParentSelectButton({ name, defaultValue, options = [], onChange = null, disabled }){ 
    const [selected, setSelected] = useState({ label: "Belum Ada", value: null })
    const buttonRef = useRef()

    useEffect(() => {
        if(defaultValue) setSelected(defaultValue)
    }, [defaultValue])

    useEffect(() => {
        initDropdowns()
    })

    const handleSelectedUpdate = ({label, value}) => { 
        buttonRef.current.click()
        setSelected({label, value})
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
                disabled
                className="w-full flex gap-2 cursor-pointer text-dark-blue/80  hover:bg-gray-200 p-2 rounded transition-colors duration-300"
                type="button"
            >
                <p className="text-start text-xs md:text-sm font-semibold flex-grow">{selected?.label}</p>
                <DropdownIcon size={16}/>
            </button>
             
            <div id={name} className={`z-[100] hidden bg-white divide-y divide-gray-100 rounded-lg border border-dark-blue/30 w-full max-w-60 max-h-48 overflow-y-auto`}>
            {!disabled &&
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    {options.map(({label, value}) => (
                        <li key={value}>
                            <button
                                disabled={selected?.label === label}
                                onClick={!disabled ? () => handleSelectedUpdate({label, value}) : null} className="block w-full text-start px-4 py-2 font-semibold disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
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