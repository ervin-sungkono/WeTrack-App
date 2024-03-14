import TeamItem from "./TeamItem";

export default function TeamList({list}){
    return (
        <div className="flex gap-3 md:gap-4">
            <TeamItem src={'/WelcomePicture.png'} name={"Test"} role={"Tester"} status={list==="pending" ? "pending" : "active"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 2"} role={"Developer"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 3"} role={"Owner"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test"} role={"Tester"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 2"} role={"Developer"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 3"} role={"Owner"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test"} role={"Tester"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 2"} role={"Developer"} />
            <TeamItem src={'/WelcomePicture.png'} name={"Test 3"} role={"Owner"} />
        </div>
    )
}