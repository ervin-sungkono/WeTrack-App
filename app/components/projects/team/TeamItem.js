import Image from "next/image";
import UserIcon from "../../common/UserIcon";
import SelectButton from "../../common/SelectButton";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";

export default function TeamItem({editMode=false, image=null, id, name, role, status="active"}){

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

    const getSelectRoleClass = () => {
        switch(role){
            case "Owner":
                return "border-[#E1B829] text-[#E1B829]"
            case "Member":
                return "border-basic-blue text-basic-blue"
            case "Viewer":
                return "border-success-green text-success-green"
        }
    }

    const getRoleClass = () => {
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
        <div className="relative mt-4 mb-12">
            {(editMode && role != 'Owner') && (
                <CloseCircle onClick={handleDelete} className="absolute -top-4 -right-4 text-3xl text-danger-red cursor-pointer"/>
            )}
            <div className={`h-full flex flex-col justify-between items-center px-3 md:px-6 py-2.5 md:py-4 rounded-xl shadow-md bg-white w-48 md:w-64`}>
                <div>
                    {image === null ? (
                        <UserIcon fullName={name} size="team"/>
                    ) : (
                        <Image src={image} alt={name} width={100} height={100}/>
                    )}
                </div>
                <div className={`mt-4 font-semibold text-dark-blue text-center text-sm md:text-base leading-4 md:leading-5`}>
                    {name}
                </div>
                {status !== "pending" && (
                    (editMode && role != 'Owner') ? (
                        <div className="mt-4 mb-6">
                            <SelectButton
                                name={`${id}`}
                                placeholder={role}
                                options={roleOptions}
                                onChange={handleRoleChange}
                                buttonClass={getSelectRoleClass()}
                            />
                        </div>
                    ) : (
                        <button className={`mt-4 text-xs md:text-sm px-3 md:px-4 py-2 md:py-1.5 rounded-full text-white font-medium ${getRoleClass()}`}>
                            {role}
                        </button>
                    )
                )}
            </div>
        </div>
    )
}