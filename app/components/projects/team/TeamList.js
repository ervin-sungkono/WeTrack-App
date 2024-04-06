import TeamItem from "./TeamItem";

export default function TeamList({list, edit=false}){
    return (
        <div className="flex flex-row gap-4 md:gap-6">
            <TeamItem editMode={edit} id={1} name={"Ervin Cahyadinata Sungkono"} role={"Owner"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} id={2} name={"Kenneth Nathanael"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} id={3} name={"Christopher Vinantius"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} id={4} name={"No Name"} role={"Member"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem editMode={edit} id={5} name={"QA Tester"} role={"Viewer"} status={list==="pending" ? "pending" : "active"} />
        </div>
    )
}