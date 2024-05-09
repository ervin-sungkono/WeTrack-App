import TeamItem from "./TeamItem";

export default function TeamList({list, listType, selectUpdate, setSelectUpdate, selectDelete, setSelectDelete, handleDelete, setAddMode, query, edit=false}){
    return (
        <>
            {listType === "pending" && list.length === 0 && edit === false && (
                query === "" ? (
                    <div className="flex justify-start">
                        <TeamItem pending setAddMode={setAddMode}/>
                    </div>
                ) : (
                    <div className="">
                        Tidak ada data anggota yang ditemukan.
                    </div>
                )
            )}
            <div className="flex flex-row gap-2 md:gap-4">
                {list.map((item, index) => (
                    <TeamItem key={index} selectUpdate={selectUpdate} setSelectUpdate={setSelectUpdate} selectDelete={selectDelete} setSelectDelete={setSelectDelete} handleDelete={handleDelete} editMode={edit} status={listType==="pending" ? "pending" : "accepted"} {...item} />
                ))}
            </div>
        </>
    )
}