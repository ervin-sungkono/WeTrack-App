import Image from "next/image";
import Button from "../../common/button/Button";

export default function TeamItem({image, name, role, status="active"}){

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
            case "Owner":
                return "bg-warning-yellow"
            case "Developer":
                return "bg-basic-blue"
            case "Tester":
                return "bg-success-green"
        }
    }

    return (
        <div className={`flex flex-col items-center p-4 rounded-xl shadow-md ${getStatus()}`}>
            <div>
                <Image src={image} alt={name} width={100} height={100}/>
            </div>
            <div className={`font-bold ${getNameStyle()}`}>
                {name}
            </div>
            {status !== "pending" && (
                <button className={`mt-4 text-sm px-2 py-1 rounded-full text-white font-medium ${getRole()}`}>
                    {role}
                </button>
            )}
        </div>
    )
}