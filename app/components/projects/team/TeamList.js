import TeamItem from "./TeamItem";
import { IoMdPeople as TeamsIcon } from "react-icons/io";

export default function TeamList({list, listType, selectUpdate, setSelectUpdate, selectDelete, setSelectDelete, setAddMode, query, owner=false, edit=false}){
    return (
        <>
            {listType === "pending" && list.length === 0 && edit === false && (
                query === "" ? (
                    owner ? (
                        <div className="flex justify-start">
                            <TeamItem pending setAddMode={setAddMode}/>
                        </div>
                    ) : (
                        <div className="min-h-[100px] flex flex-col justify-center items-center gap-2">
                            <TeamsIcon size={48} className="text-dark-blue/60"/>
                            Tidak ada data anggota yang ditemukan.
                        </div>
                    )
                ) : (
                    <div className="min-h-[100px] flex flex-col justify-center items-center gap-2">
                        <TeamsIcon size={48} className="text-dark-blue/60"/>
                        Tidak ada data anggota yang ditemukan.
                    </div>
                )
            )}
            <div className="flex flex-row gap-2 md:gap-4">
                {list.map((item, index) => (
                    <TeamItem key={index} selectUpdate={selectUpdate} setSelectUpdate={setSelectUpdate} selectDelete={selectDelete} setSelectDelete={setSelectDelete} editMode={edit} userId={item.userId} {...item} />
                ))}
            </div>
        </>
    )
}