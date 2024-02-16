import { useEffect } from "react"
import { initDropdowns } from "flowbite"
import { BsThreeDots } from "react-icons/bs"

export default function TableActionButton({ actions, id }){
    useEffect(() => {
        initDropdowns()
    })
    return(
        <div className="flex justify-center items-center">
            <button 
                id={`actionsDropdownButton-${id}`}
                data-dropdown-toggle={`actionsDropdown-${id}`}
                type="button"
                className="text-dark/80"
            >
                <BsThreeDots size={20}/>
            </button>
            <div 
                id={`actionsDropdown-${id}`} 
                className="w-full max-w-[120px] hidden z-fixed divide-y divide-gray-100 bg-white rounded-md shadow-md border border-dark/30"
            >
                <ul className="py-1.5 text-sm text-dark" aria-labelledby={`actionsDropdownButton-${id}`}>
                    {actions.map(action => (
                        <li key={`${action}-${id}`}>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-300">{action}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>  
    )
}