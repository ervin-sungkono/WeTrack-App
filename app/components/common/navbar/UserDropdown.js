'use client'
import UserIcon from "../UserIcon"
import Link from "next/link"
import { IoMdArrowDropdown as DropdownIcon } from 'react-icons/io'
import { useEffect } from "react"
import { initDropdowns } from "flowbite"

export default function UserDropdown({ username }){
    useEffect(() => {
        initDropdowns()
    })
    return(
        <>
            <button 
                className="flex items-center gap-1 px-2 py-1"
                data-dropdown-toggle="user-dropdown"
                data-dropdown-placement="bottom-end"
                data-dropdown-trigger="click"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="0"
            >
                <UserIcon username={username}/>
                <DropdownIcon size={20}/>
            </button>
            <div
                id="user-dropdown"
                className="z-10 hidden bg-white divide-y divide-gray-100 border border-black/20 rounded-md shadow-sm w-48"
            >
                <ul className="py-2 text-sm text-dark-blue/80">
                    <li>
                        <Link
                            href={"#"}
                            className="block px-4 py-2 hover:bg-gray-100"
                        >
                            Sign Out
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}