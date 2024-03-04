/* eslint-disable react/no-children-prop */
import { useSession } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "../common/button/Button"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useState } from "react"
import ChangePasswordForm from "../common/form/profile/ChangePasswordForm"
import DeleteAccountForm from "../common/form/profile/DeleteAccountForm"
import UpdateProfileForm from "../common/form/profile/UpdateProfileForm"

export default function ProfileLayout(){
    const { data: session, status } = useSession()
    
    const initialValues = {
        description: "",
        jobPosition: "",
        location: ""
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [changePassword, setChangePassword] = useState(false)
    const [updateProfile, setUpdateProfile] = useState(false)
    const [deleteAccount, setDeleteAccount] = useState(false)

    const handleChangePassword = async (values) => {
        setError(false);
        setLoading(true);
    }

    const handleUpdateProfile = async (values) => {
        setError(false);
        setLoading(true);
    }

    const handleDeleteAccount = async () => {
        setError(false);
        setLoading(true);
    }
    
    if(status === "loading"){
        return (
            <PopUpLoad />
        )
    }else{
        return (
            <>
                <div className="fixed h-1/8 md:h-1/6 bg-basic-blue w-full">
                    
                </div>
                <div className="container w-5/6 md:w-3/4 xl:w-3/5 flex flex-col justify-center">
                    <div className="absolute" style={
                        {
                            top: "10%",
                            left: "50%",
                            transform: "translateX(-50%)",
                        }
                    }>
                        <div className="flex items-center justify-center mt-16">
                            <UserIcon
                                fullName={session.user.fullName}
                                src={session.user.profileImage}
                                size="profile"
                            />
                        </div>
                        <div className="text-center mt-2 md:mt-4">
                            <p className="text-lg md:text-xl font-bold leading-5">{session.user.fullName}</p>
                            <p className="text-xs md:text-sm mt-1 md:mt-0">Joined at</p>
                        </div>
                    </div>
                    <div className="mt-56 md:mt-72 overflow-auto sm:overflow-hidden">
                        {updateProfile && (
                            <UpdateProfileForm initialValues={initialValues} setUpdateProfile={setUpdateProfile} handleUpdateProfile={handleUpdateProfile} />
                        )}
                        {!updateProfile && (
                            <div>
                                <div>
                                    <div>
                                        <div className="flex items-center">
                                            <IoIosInformationCircle size={24}/>
                                            <p className="text-sm md:text-base font-bold ml-2">Description</p>
                                        </div>
                                        <p className="text-xs md:text-sm ml-8">No description yet.</p>
                                    </div>
                                    <div className="mt-6">
                                        <div className="flex items-center">
                                            <MdEmail size={24}/>
                                            <p className="text-sm md:text-base font-bold ml-2">Email</p>
                                        </div>
                                        <p className="text-xs md:text-sm ml-8">{session.user.email}</p>
                                    </div>
                                    <div className="mt-6">
                                        <div className="flex items-center">
                                            <TbBriefcaseFilled size={24}/>
                                            <p className="text-sm md:text-base font-bold ml-2">Job Position</p>
                                        </div>
                                        <p className="text-xs md:text-sm ml-8">No job position yet.</p>
                                    </div>
                                    <div className="mt-6">
                                        <div className="flex items-center">
                                            <IoMdPin size={24}/>
                                            <p className="text-sm md:text-base font-bold ml-2">Location</p>
                                        </div>
                                        <p className="text-xs md:text-sm ml-8">No location yet.</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-center md:text-left">
                                    <p className="text-md md:text-lg font-bold">Manage Account</p>
                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-3 md:mt-4">
                                        <Button variant="primary" onClick={() => setChangePassword(true)}>Change Password</Button>
                                        <Button variant="secondary" onClick={() => setUpdateProfile(true)}>Update Profile</Button>
                                        <Button variant="danger-secondary" onClick={() => setDeleteAccount(true)}>Delete Account</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {changePassword && (
                    <ChangePasswordForm
                        onConfirm={handleChangePassword}
                        onClose={() => setChangePassword(false)}
                    />
                )}
                {deleteAccount && (
                    <DeleteAccountForm
                        onConfirm={handleDeleteAccount}
                        onClose={() => setDeleteAccount(false)}
                    />
                )}
                {loading && (
                    <PopUpLoad />
                )}
            </>
        )
    }
}