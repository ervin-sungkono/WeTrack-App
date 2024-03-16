import TeamItem from "./TeamItem";

export default function TeamList({list}){
    return (
        <div className="flex flex-row gap-3 md:gap-4">
            <TeamItem name={"Ervin Cahyadinata Sungkono"} role={"Owner"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Kenneth Nathanael"} role={"Developer"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Christopher Vinantius"} role={"Developer"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"No Name"} role={"Developer"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Indrabudhi Lokaadinugroho"} role={"Viewer"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"QA Tester"} role={"Viewer"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Project Manager"} role={"Viewer"} status={list==="pending" ? "pending" : "active"} />
        </div>
    )
}