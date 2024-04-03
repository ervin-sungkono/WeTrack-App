import TeamItem from "./TeamItem";

export default function TeamList({list, edit=false}){
    return (
        <div className="flex flex-row gap-4 md:gap-6">
            <TeamItem editMode={edit} name={"Ervin Cahyadinata Sungkono"} role={"Owner"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} name={"Kenneth Nathanael"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} name={"Christopher Vinantius"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} name={"No Name"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} name={"QA Tester"} role={"Viewer"} status={list==="pending" ? "pending" : "active"} />
        </div>
    )
}