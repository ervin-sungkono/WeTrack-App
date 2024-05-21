import { useState } from "react";
import UserIcon from "../../common/UserIcon";
import SelectButton from "../../common/button/SelectButton";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";
import Button from "../../common/button/Button";
import Link from "next/link";

export default function TeamItem({selectUpdate, setSelectUpdate, selectDelete, setSelectDelete, editMode=false, id, user, userId, role, pending=false, setAddMode}){

    const [roleSelected, setRoleSelected] = useState(role)
    const [deleteSelected, setDeleteSelected] = useState(false)

    const roleOptions = [
        {label: "Member", value: "Member"},
        {label: "Viewer", value: "Viewer"},
    ]

    const profileImage = user?.profileImage !== null ? user?.profileImage.attachmentStoragePath : null
    const profileImagePending = `/images/user-placeholder.png`

    const handleRoleChange = (value) => {
        setRoleSelected(value)
        if(id === selectUpdate.find(item => item.id === id)?.id || value === role){
            setSelectUpdate(selectUpdate.filter(item => item.id !== id))
            return
        }
        if(id === selectDelete.find(item => item.id === id)?.id){
            setSelectDelete(selectDelete.filter(item => item.id !== id))
            setDeleteSelected(false)
        }
        const userUpdate = {
            id: id,
            fullName: user?.fullName,
            oldRole: role,
            newRole: value
        }
        setSelectUpdate([
            ...selectUpdate,
            userUpdate
        ])
    }
    
    const handleUserDelete = () => {
        setDeleteSelected(true)
        if(id === selectDelete.find(item => item.id === id)?.id){
            setSelectDelete(selectDelete.filter(item => item.id !== id))
            setDeleteSelected(false)
            return
        }
        if(id === selectUpdate.find(item => item.id === id)?.id){
            setSelectUpdate(selectUpdate.filter(item => item.id !== id))
            setRoleSelected(role)
        }
        const userDelete = {
            id: id,
            fullName: user.fullName
        }
        setSelectDelete([
            ...selectDelete,
            userDelete
        ])
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
                return "bg-warning-yellow text-black"
            case "Member":
                return "bg-basic-blue text-white"
            case "Viewer":
                return "bg-success-green text-white"
        }
    }

    return (
        <div className="relative mt-4 mb-12">
            {(editMode && role != 'Owner') && (
                <CloseCircle onClick={handleUserDelete} className="absolute -top-4 -right-4 text-3xl text-danger-red cursor-pointer"/>
            )}
            <div className={`h-full flex flex-col justify-between items-center m-auto px-3 md:px-6 py-2.5 md:py-4 rounded-xl shadow-md ${pending ? 'bg-light-blue' : (editMode && deleteSelected) ? 'bg-danger-red' : 'bg-white'} w-48 md:w-64`}>
                {!pending ? (
                    <>
                        {editMode ? (
                            <UserIcon fullName={user?.fullName} size="team" src={profileImage}/>
                        ) : (
                            <Link href={`/profile/${userId}`}>
                                <div className="hover:brightness-75">
                                    <UserIcon fullName={user?.fullName} size="team" src={profileImage}/>
                                </div>
                            </Link>
                        )}
                    </>
                ) : (
                    <UserIcon size="team" src={profileImagePending}/>
                )}
                {!pending && (
                    <>
                        {editMode ? (
                            <div className={`mt-4 font-semibold ${pending || (editMode && deleteSelected) ? 'text-white' : 'text-dark-blue'} text-center text-sm md:text-base leading-4 md:leading-5`}>
                                {user?.fullName}
                            </div>
                        ) : (
                            <Link href={`/profile/${userId}`}>
                                <div className={`mt-4 font-semibold ${pending || (editMode && deleteSelected) ? 'text-white' : 'text-dark-blue'} text-center text-sm md:text-base leading-4 md:leading-5`}>
                                    {user?.fullName}
                                </div>
                            </Link>
                        )}
                    </>
                )}
                {
                    (editMode && role != 'Owner') ? (
                        <div className="mt-4 mb-6">
                            <SelectButton
                                name={`${id}`}
                                placeholder={roleSelected || role}
                                defaultValue={roleSelected || role}
                                options={roleOptions}
                                onChange={handleRoleChange}
                                buttonClass={getSelectRoleClass()}
                            />
                        </div>
                    ) : (
                        <button className={`cursor-default mt-4 mb-6 text-xs md:text-sm px-3 md:px-4 py-2 md:py-1.5 rounded-full font-medium ${getRoleClass()}`}>
                            {role}
                        </button>
                    )
                }
                {pending && (
                    <Button variant="primary" onClick={setAddMode}>
                        Tambah Anggota
                    </Button>
                )}
            </div>
        </div>
    )
}