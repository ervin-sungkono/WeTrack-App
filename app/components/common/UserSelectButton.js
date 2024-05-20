"use client"
import { useEffect, useState, useRef } from "react"
import { initDropdowns } from "flowbite"

import { IoIosArrowDown as DropdownIcon } from 'react-icons/io'
import UserIcon from "./UserIcon"

export default function  UserSelectButton({ name, type = "default", userId, placeholder, options = [], onChange = null, disabled, defaultValue }){ 
    const [selected, setSelected] = useState(defaultValue ?? {})
    const [loaded, setLoaded] = useState(false)
    const buttonRef = useRef()

    useEffect(() => {
        initDropdowns()
    })

    useEffect(() => {
        setSelected(defaultValue ?? {})
    }, [defaultValue])

    useEffect(() => {
        if(selected){
            setLoaded(true)
        }else{
            setLoaded(false)
        }
    }, [selected])

    const handleSelectedUpdate = (e, value) => { 
        e.stopPropagation()
        buttonRef.current.click()
        setSelected(value)
        if(typeof onChange == "function") onChange(value)
    }

    if(type == "icon")
    return(
        <div>
            <button 
                ref={buttonRef}
                data-dropdown-toggle={name} 
                data-dropdown-placement="bottom-start"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="4"
                className="flex items-center gap-1 font-semibold text-xs md:text-sm text-dark-blue disabled:text-gray-700 disabled:bg-gray-300 hover:text-basic-blue rounded-md focus:ring-0 focus:outline-none transition-colors duration-300 ease-in-out" 
                type="button"
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
            >
                {(loaded || placeholder) && <div className="flex flex-grow gap-2 items-center">
                    <UserIcon size="sm" fullName={placeholder?.fullName ?? selected.fullName} src={placeholder ? placeholder?.profileImage?.attachmentStoragePath : (selected.fullName ? selected.profileImage?.attachmentStoragePath : '/images/user-placeholder.png')}/>
                </div>}
            </button>
            <div id={name} className="z-fixed hidden bg-white divide-y divide-gray-100 rounded-md border border-dark-blue/30 w- md:w-64 max-h-48 overflow-y-auto">
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    <li>
                        <button
                            type="button"
                            disabled={!selected.id}
                            onClick={(e) => handleSelectedUpdate(e, {})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                        >
                            <div className="flex flex-grow gap-2 items-center">
                                <div className="flex-shrink-0">
                                    <UserIcon size="sm" src={"/images/user-placeholder.png"}/>
                                </div>
                                <p className="text-start flex-grow truncate text-xs md:text-sm">Belum ditugaskan</p>
                            </div>
                        </button>
                    </li>
                    {options.map(({ user: {id, fullName, profileImage } }) => (
                        <li key={id}>
                            <button
                                type="button"
                                disabled={selected && selected.id === id}
                                onClick={(e) => handleSelectedUpdate(e, {id, fullName, profileImage})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                            >
                                <div className="flex flex-grow gap-2 items-center">
                                    <div className="flex-shrink-0">
                                        <UserIcon size="sm" fullName={fullName} src={profileImage?.attachmentStoragePath}/>
                                    </div>
                                    <p className="text-start flex-grow truncate text-xs md:text-sm">{fullName}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )

    if(type == "button")
    return(
        <div>
            <button 
                ref={buttonRef}
                data-dropdown-toggle={name} 
                data-dropdown-placement="bottom-start"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="4"
                className="flex items-center gap-1 font-semibold text-xs md:text-sm text-dark-blue disabled:text-gray-700 hover:text-basic-blue rounded-md focus:ring-0 focus:outline-none transition-colors duration-300 ease-in-out" 
                type="button"
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
            >
                {(loaded || placeholder) && <div className="flex flex-grow gap-2 items-center">
                    <UserIcon size="sm" fullName={placeholder?.fullName ?? selected.fullName} src={placeholder ? placeholder?.profileImage : (selected.fullName ? selected.profileImage : '/images/user-placeholder.png')}/>
                    <p className="text-start flex-grow truncate text-xs md:text-sm">{placeholder?.fullName ?? selected.fullName ?? "Belum ditugaskan"}</p>
                </div>}
            </button>
            <div id={name} className="z-50 hidden bg-white divide-y divide-gray-100 rounded-md border border-dark-blue/30 w-60 md:w-80 max-h-48 overflow-y-auto">
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    <li>
                        <button
                            disabled={!selected.id}
                            onClick={(e) => handleSelectedUpdate(e, {})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                        >
                            <div className="flex flex-grow gap-2 items-center">
                                <div className="flex-shrink-0">
                                    <UserIcon size="sm" src={"/images/user-placeholder.png"}/>
                                </div>
                                <p className="text-start flex-grow truncate text-xs md:text-sm">Belum ditugaskan</p>
                            </div>
                        </button>
                    </li>
                    {options.map(({ user: {id, fullName, profileImage } }) => (
                        <li key={id}>
                            <button
                                disabled={selected && selected.id === id}
                                onClick={(e) => handleSelectedUpdate(e, {id, fullName, profileImage})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                            >
                                <div className="flex flex-grow gap-2 items-center">
                                    <div className="flex-shrink-0">
                                        <UserIcon size="sm" fullName={fullName} src={profileImage?.attachmentStoragePath}/>
                                    </div>
                                    <p className="text-start flex-grow truncate text-xs md:text-sm">{fullName}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )

    if(type == "default")
    return(
        <div>
            <button 
                ref={buttonRef}
                data-dropdown-toggle={name} 
                data-dropdown-placement="bottom-start"
                data-dropdown-delay="0"
                data-dropdown-offset-distance="4"
                className="w-full flex items-center gap-1 font-semibold text-xs md:text-sm text-dark-blue disabled:text-gray-700 disabled:bg-gray-300 hover:text-basic-blue px-3 py-1.5 md:px-4 md:py-2 rounded-md focus:ring-0 focus:outline-none border border-dark-blue/30 transition-colors duration-300 ease-in-out" 
                type="button"
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
            >
                {(loaded || placeholder) && <div className="flex flex-grow gap-2 items-center">
                    <UserIcon size="sm" fullName={placeholder?.fullName ?? selected.fullName} src={placeholder ? placeholder?.profileImage : (selected.fullName ? selected.profileImage : '/images/user-placeholder.png')}/>
                    <p className="text-start flex-grow truncate text-xs md:text-sm">{placeholder?.fullName ?? selected.fullName ?? "Belum ditugaskan"}</p>
                </div>}
                {!disabled && <DropdownIcon size={16}/>}
            </button>
            <div id={name} className="z-50 hidden bg-white divide-y divide-gray-100 rounded-md border border-dark-blue/30 w-60 md:w-80 max-h-48 overflow-y-auto">
                <ul className="py-2 text-xs md:text-sm text-gray-700">
                    <li>
                        <button
                            disabled={!selected.id}
                            onClick={(e) => handleSelectedUpdate(e, {})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                        >
                            <div className="flex flex-grow gap-2 items-center">
                                <div className="flex-shrink-0">
                                    <UserIcon size="sm" src={"/images/user-placeholder.png"}/>
                                </div>
                                <p className="text-start flex-grow truncate text-xs md:text-sm">Belum ditugaskan</p>
                            </div>
                        </button>
                    </li>
                    {options.map(({ user: {id, fullName, profileImage } }) => (
                        <li key={id}>
                            <button
                                disabled={selected && selected.id === id}
                                onClick={(e) => handleSelectedUpdate(e, {id, fullName, profileImage})} className="block w-full text-start px-4 py-2 disabled:bg-gray-300 disabled:text-dark-blue hover:bg-gray-100 hover:text-basic-blue transition-colors duration-300 ease-in-out"
                            >
                                <div className="flex flex-grow gap-2 items-center">
                                    <div className="flex-shrink-0">
                                        <UserIcon size="sm" fullName={fullName} src={profileImage?.attachmentStoragePath}/>
                                    </div>
                                    <p className="text-start flex-grow truncate text-xs md:text-sm">{fullName}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {!disabled && userId && 
            <button 
                type="button"
                className="text-[10.8px] py-1 md:text-xs text-basic-blue font-semibold hover:underline"
                onClick={() => setSelected(options.find(({user}) => user.id === userId)?.user ?? {})}
            >
                Tugaskan kepada saya
            </button>}
        </div>
    )
}