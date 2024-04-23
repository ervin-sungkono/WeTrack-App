import TeamItem from "./TeamItem";

export default function TeamList({list, listType, edit=false}){
    return (
        <div className="flex flex-row gap-2 md:gap-4">
            {list.map((item, index) => (
                <TeamItem key={index} editMode={edit} status={listType==="pending" ? "pending" : "active"}  {...item} />
            ))}
        </div>
    )
}