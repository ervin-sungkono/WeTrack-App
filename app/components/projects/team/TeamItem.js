import Image from "next/image";
import UserIcon from "../../common/UserIcon";

export default function TeamItem({image=null, name, role, status="active"}){

    const getStatus = () => {
        switch(status){
            case "pending":
                return "bg-basic-blue"
            case "active":
                return "bg-white"
        }
    }

    const getNameStyle = () => {
        switch(status){
            case "pending":
                return "text-white"
            case "active":
                return "text-dark-blue"
        }
    }

    const getRole = () => {
        switch(role){
            case "Pemilik":
                return "bg-danger-red"
            case "Pengembang":
                return "bg-basic-blue"
            case "Pelihat":
                return "bg-success-green"
        }
    }

    return (
        <div className={`flex flex-col justify-between items-center px-6 md:px-10 py-4 md:py-6 rounded-xl shadow-md ${getStatus()} w-64`}>
            <div>
                {image === null ? (
                    <UserIcon fullName={name} size="team"/>
                ) : (
                    <Image src={image} alt={name} width={100} height={100}/>
                )}
            </div>
            <div className={`mt-4 font-bold ${getNameStyle()} text-center text-sm md:text-base leading-4 md:leading-5`}>
                {name}
            </div>
            {status !== "pending" && (
                <button className={`mt-4 text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-white font-medium ${getRole()}`}>
                    {role}
                </button>
            )}
        </div>
    )
}