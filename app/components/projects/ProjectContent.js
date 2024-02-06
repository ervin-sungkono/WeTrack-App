"use client"
import SearchBar from "../common/SearchBar"

export default function ProjectContent(){
    const handleSearch = (query) => {
        console.log(query)
    }
    
    return(
        <div className="mt-4 md:mt-6">
            <SearchBar placeholder={"Search task.."} handleSearch={handleSearch}/>
        </div>
    )
}