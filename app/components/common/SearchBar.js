"use client"
import { debounce } from "@/app/lib/helper"
import { BsSearch as SearchIcon } from 'react-icons/bs'

export default function SearchBar({ placeholder, handleSearch }){
    return(
        <label className="flex items-center px-2.5 py-1.5 md:px-4 md:py-2.5 gap-2 w-[180px] focus-within:w-56 focus-within:md:w-64 transition-[width] duration-300 ease-in-out text-dark-blue border border-dark-blue/30 rounded-lg group">
            <input 
                className="w-full p-0 border-none bg-inherit focus:ring-0 text-xs md:text-sm"
                type="text"
                placeholder={placeholder}
                onChange={debounce((e) => handleSearch(e.target.value), 500)}
            />
            <SearchIcon size={20} className="group-focus-within:text-basic-blue transition-colors duration-300 ease-in-out"/>
        </label>
    )
}