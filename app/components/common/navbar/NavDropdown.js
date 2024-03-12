'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { initDropdowns } from 'flowbite'
import { usePathname } from 'next/navigation'

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'

export default function NavDropdown({ label, baseLink = '/', dropdownLinks = [], children }){
    const pathname = usePathname()
    useEffect(() => {
       initDropdowns()
    })

    return(
        <>
            <button 
                className={`
                    ${pathname.includes(baseLink) ? "text-basic-blue" : "text-dark-blue hover:text-basic-blue"} select-none
                    relative w-full h-full flex items-center gap-1 px-2 md:px-4 py-4 lg:py-0 font-medium text-sm transition-colors duration-300
                    after:absolute after:bottom-0 after:left-0 after:w-full after:scale-x-0 after:hover:scale-x-100 after:origin-center after:h-1 after:bg-basic-blue after:transition-transform after:duration-300
                `}
                data-dropdown-toggle={label.toLowerCase().split(' ').join('-')}
                data-dropdown-placement="bottom-start"
                data-dropdown-trigger="click"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="-10"
            >
                {label}
                <DropdownIcon size={20}/>
            </button>
            <div
                id={label.toLowerCase().split(' ').join('-')}
                className="z-10 hidden bg-white divide-y divide-gray-100 border border-dark-blue/30 rounded-md shadow-sm w-56 lg:w-64"
            >
                {children}
                <ul className="py-2 text-sm text-dark-blue/80">
                {dropdownLinks.map(({label, url}) => (
                    <li key={label}>
                    <Link
                        href={url}
                        className="block px-4 py-2 hover:bg-gray-100"
                    >
                        {label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
        </>
    )
}