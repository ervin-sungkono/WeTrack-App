import { useState } from "react";
import UserIcon from "../../common/UserIcon";
import SelectButton from "../../common/button/SelectButton";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";
import Button from "../../common/button/Button";

export default function TeamItem({setSelectUpdate, setSelectDelete, handleDelete, editMode=false, id, user, role, status, pending=false, setAddMode}){

    const [roleSelected, setRoleSelected] = useState(role) 

    const roleOptions = [
        {label: "Member", value: "Member"},
        {label: "Viewer", value: "Viewer"},
    ]

    const profileImage = user?.profileImage !== null ? user?.profileImage.attachmentStoragePath : null
    const profileImagePending = `/images/user-placeholder.png`

    const handleRoleChange = (value) => {
        setRoleSelected(value)
        if(value === role){
            setSelectUpdate(null)
        }else{
            const userUpdate = {
                id: id,
                fullName: user?.fullName,
                oldRole: role,
                newRole: value
            }
            setSelectUpdate(userUpdate)
        }
    }

    const getSelectRoleClass = () => {
        switch(roleSelected){
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
                <CloseCircle onClick={() => {
                    const userDelete = {
                        id: id,
                        fullName: user.fullName
                    }
                    setSelectDelete(userDelete)
                    handleDelete()
                }} className="absolute -top-4 -right-4 text-3xl text-danger-red cursor-pointer"/>
            )}
            <div className={`h-full flex flex-col justify-between items-center m-auto px-3 md:px-6 py-2.5 md:py-4 rounded-xl shadow-md ${pending ? 'bg-light-blue' : 'bg-white'} w-48 md:w-64`}>
                {!pending ? (
                    <UserIcon fullName={user?.fullName} size="team" src={profileImage}/>
                ) : (
                    <UserIcon size="team" src={profileImagePending}/>
                )}
                {!pending && (
                    <div className={`mt-4 font-semibold ${pending ? 'text-white' : 'text-dark-blue'} text-center text-sm md:text-base leading-4 md:leading-5`}>
                        {user?.fullName}
                    </div>
                )}
                {status !== "pending" && (
                    (editMode && role != 'Owner') ? (
                        <div className="mt-4 mb-6">
                            <SelectButton
                                name={`${id}`}
                                placeholder={roleSelected}
                                defaultValue={roleSelected || role}
                                options={roleOptions}
                                onChange={handleRoleChange}
                                buttonClass={getSelectRoleClass()}
                            />
                        </div>
                    ) : (
                        <button className={`mt-4 mb-6 text-xs md:text-sm px-3 md:px-4 py-2 md:py-1.5 rounded-full text-white font-medium ${getRoleClass()}`}>
                            {role}
                        </button>
                    )
                )}
                {pending && (
                    <Button variant="primary" onClick={setAddMode}>
                        Tambah Anggota
                    </Button>
                )}
            </div>
        </div>
    )
}