import { initDropdowns } from "flowbite"
import { useEffect } from "react"

import { BsThreeDots as DotIcon } from "react-icons/bs"

export default function DotButton({ name, actions = [], hoverClass }){
    useEffect(() => {
        initDropdowns()
    })

    return(
        <div>
            <button 
                data-dropdown-toggle={name} 
                data-dropdown-placement="bottom-start"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="4"
                className={`p-1.5 ${hoverClass ?? "hover:bg-gray-200"} duration-200 transition-colors rounded`}
                onClick={(e) => e.stopPropagation()}
            >
                <DotIcon size={20}/>
            </button>
            <div id={name} className={`z-50 hidden bg-white divide-y divide-gray-100 rounded-lg border border-dark-blue/30 min-w-40`}>
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    {actions.map(({label, fnCall}, index) => (
                        <li key={`${name}-${index}`}>
                            <button
                                onClick={fnCall} className="block w-full text-start px-4 py-2 hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
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