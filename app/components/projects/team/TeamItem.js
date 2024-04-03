import Image from "next/image";
import UserIcon from "../../common/UserIcon";
import SelectButton from "../../common/SelectButton";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";

export default function TeamItem({editMode=false, image=null, name, role, status="active"}){

    const roleOptions = [
        {label: "Member", value: "Member"},
        {label: "Viewer", value: "Viewer"},
    ]

    const handleRoleChange = (value) => {
        console.log(value)
    }

    const handleDelete = () => {
        console.log("")
    }

    const getRole = () => {
        switch(role){
            case "Owner":
                return "bg-warning-yellow"
            case "Member":
                return "bg-basic-blue"
            case "Viewer":
                return "bg-success-green"
        }
    }

    return (
        <div className="relative mt-4 mb-8">
            {editMode && (
                <CloseCircle onClick={handleDelete} className="absolute -top-4 -right-4 text-3xl text-danger-red cursor-pointer"/>
            )}
            <div className={`flex flex-col justify-between items-center px-6 md:px-10 py-4 md:py-6 rounded-xl shadow-md bg-white w-64`}>
                <div>
                    {image === null ? (
                        <UserIcon fullName={name} size="team"/>
                    ) : (
                        <Image src={image} alt={name} width={100} height={100}/>
                    )}
                </div>
                <div className={`mt-4 font-bold text-dark-blue text-center text-sm md:text-base leading-4 md:leading-5`}>
                    {name}
                </div>
                {status !== "pending" && (
                    editMode ? (
                        <div className="mt-4">
                            <SelectButton
                                name={"role-button"}
                                placeholder={role}
                                options={roleOptions}
                                onChange={handleRoleChange}
                            />
                        </div>
                    ) : (
                        <button className={`mt-4 text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-white font-medium ${getRole()}`}>
                            {role}
                        </button>
                    )
                )}
            </div>
        </div>
    )
}