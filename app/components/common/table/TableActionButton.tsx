"use client"
import { useEffect } from "react"
import { initDropdowns } from "flowbite"
import { BsThreeDots } from "react-icons/bs"
import Link from "next/link"

type TableAction = { link?: string; label: string; onClick?: () => void }
type TableActionButtonProps = { actions: TableAction[]; id: string }

export default function TableActionButton({ actions, id }: TableActionButtonProps){
    useEffect(() => {
        initDropdowns()
    }, [])
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
                    {actions.map(({link, label, onClick}) => (
                        <li key={`${label}-${id}`}>
                            {link ? <Link href={link} className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-300">{label}</Link> : (
                                <button type="button" onClick={onClick} className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-300">{label}</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
