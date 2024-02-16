"use client"
import { useEffect, useState, useRef } from "react"
import { initDropdowns } from "flowbite"

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'

export default function SelectButton({ name, placeholder, options = [], onChange = null }){ 
    const [selected, setSelected] = useState(null)
    const buttonRef = useRef(null)

    useEffect(() => {
        initDropdowns()
    })

    const handleSelectedUpdate = (label, value) => {
        setSelected(label)
        buttonRef.current.click()
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
                className="flex items-center gap-1 font-semibold text-xs md:text-sm text-dark-blue hover:text-basic-blue px-4 py-2 rounded-full focus:ring-0 focus:outline-none border border-dark-blue/30 transition-colors duration-300 ease-in-out" type="button"
            >
                {selected ?? placeholder} 
                <DropdownIcon size={16}/>
            </button>
            <div id={name} className="z-50 hidden bg-white divide-y divide-gray-100 rounded-lg border border-dark-blue/30 min-w-40">
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    {options.map(({label, value}) => (
                        <li key={value}>
                            <button 
                                onClick={() => handleSelectedUpdate(label, value)} className="block w-full text-start px-4 py-2 hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}