import TeamItem from "./TeamItem";

export default function TeamList({list, listType, setSelectDelete, edit=false, handleDelete}){
    return (
        <div className="flex flex-row gap-2 md:gap-4">
            {list.map((item, index) => (
                <TeamItem key={index} setSelectDelete={setSelectDelete} handleDelete={handleDelete} editMode={edit} status={listType==="pending" ? "pending" : "accepted"} {...item} />
            ))}
        </div>
    )
}