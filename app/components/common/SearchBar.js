"use client"
import { debounce } from "@/app/lib/helper"
import { BsSearch as SearchIcon } from 'react-icons/bs'

export default function SearchBar({ placeholder, handleSearch }){
    return(
        <div className="flex items-center px-4 py-2.5 gap-2 w-[200px] focus-within:w-72 transition-[width] duration-300 ease-in-out text-dark-blue border border-dark-blue/30 rounded-lg">
            <input 
                className="w-full p-0 border-none bg-inherit focus:ring-0"
                type="text"
                placeholder={placeholder}
                onChange={debounce((e) => handleSearch(e.target.value), 500)}
            />
            <SearchIcon size={20}/>
        </div>
    )
}