"use client"
import SearchBar from "../common/SearchBar"
import SelectButton from "../common/SelectButton"

export default function ProjectContent(){
    const handleSearch = (query) => {
        console.log(query)
    }

    const statusOptions = [
        {
            label: "TODO",
            value: "01"
        },
        {
            label: "On Progress",
            value: "02"
        },
        {
            label: "Completed",
            value: "03"
        },
    ]

    const handleStatusChange = (value) => {
        console.log(value)
    }
    
    return(
        <div className="flex justify-between mt-4 md:mt-6">
            <div className="flex items-center gap-3 md:gap-6">
                <SearchBar placeholder={"Search task.."} handleSearch={handleSearch}/>
                <div className="flex items-center gap-2 md:gap-4">
                    <SelectButton 
                        name={"status-button"}
                        placeholder={"Status"} 
                        options={statusOptions} 
                        onChange={handleStatusChange}
                    />
                    <SelectButton 
                        name={"assignee-button"}
                        placeholder={"Assignee"} 
                        options={statusOptions} 
                        onChange={handleStatusChange}
                    />
                </div>
            </div>
        </div>
    )
}