import TeamItem from "./TeamItem";

export default function TeamList({list}){
    return (
        <div className="flex flex-row gap-3 md:gap-4">
            <TeamItem name={"Ervin Cahyadinata Sungkono"} role={"Pemilik"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Kenneth Nathanael"} role={"Pengembang"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Christopher Vinantius"} role={"Pengembang"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"No Name"} role={"Pengembang"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Indrabudhi Lokaadinugroho"} role={"Pelihat"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"QA Tester"} role={"Pelihat"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem name={"Project Manager"} role={"Pelihat"} status={list==="pending" ? "pending" : "active"} />
        </div>
    )
}