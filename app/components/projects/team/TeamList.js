import TeamItem from "./TeamItem";

export default function TeamList({list, listType, selectUpdate, setSelectUpdate, selectDelete, setSelectDelete, setAddMode, query, edit=false}){
    return (
        <>
            {listType === "pending" && list.length === 0 && edit === false && (
                query === "" ? (
                    <div className="flex justify-start">
                        <TeamItem pending setAddMode={setAddMode}/>
                    </div>
                ) : (
                    <div>
                        Tidak ada data anggota yang ditemukan.
                    </div>
                )
            )}
            <div className="flex flex-row gap-2 md:gap-4">
                {list.map((item, index) => (
                    <TeamItem key={index} selectUpdate={selectUpdate} setSelectUpdate={setSelectUpdate} selectDelete={selectDelete} setSelectDelete={setSelectDelete} editMode={edit} {...item} />
                ))}
            </div>
        </>
    )
}