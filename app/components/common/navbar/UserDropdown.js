'use client'
import UserIcon from "../UserIcon"
import Link from "next/link"
import { IoMdArrowDropdown as DropdownIcon } from 'react-icons/io'
import { useEffect, useRef } from "react"
import { initDropdowns } from "flowbite"
import { signOut } from "next-auth/react"

export default function UserDropdown({ fullName, email, profileImage }){
    const buttonRef = useRef()
    useEffect(() => {
        initDropdowns()
    })

    const handleSignOut = async() => {
        buttonRef.current.click()
        await signOut({ callbackUrl: '/dashboard' })
    }

    return(
        <>
            <button 
                ref={buttonRef}
                className="h-full flex items-center gap-1 px-2 py-4 lg:py-0"
                data-dropdown-toggle="user-dropdown"
                data-dropdown-placement="bottom-end"
                data-dropdown-trigger="click"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="-10"
            >
                <UserIcon fullName={fullName} src={profileImage?.attachmentStoragePath}/>
                <DropdownIcon size={20}/>
            </button>
            <div
                id="user-dropdown"
                className="z-10 hidden bg-white divide-y divide-gray-300 border border-dark-blue/30 rounded-md shadow-sm w-48"
            >
                <div className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-semibold">{fullName}</div>
                    <div className="text-dark-blue/80 truncate">{email}</div>
                </div>
                <ul className="py-2 text-sm text-dark-blue/80">
                    <li>
                        <Link
                            href={"/profile"}
                            className="block px-4 py-2 hover:bg-gray-100"
                        >
                            Profil
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={"#signout"}
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={handleSignOut}
                        >
                            Keluar
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}