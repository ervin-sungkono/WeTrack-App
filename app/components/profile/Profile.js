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
        email: session?.user.email,
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

    const ProfileField = ({icon, label, value}) => {
        return (
            <div className="flex gap-2">
                <div>
                    {icon}
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <p className="block font-semibold text-sm md:text-base">
                        {label}
                    </p>
                    <div className="relative flex items-center">
                        <div className={`w-full rounded-md bg-transparent text-xs md:text-sm`}>
                            {value}
                        </div>
                    </div>
                </div>
            </div>
        )             
    }
    
    if(!session){
        return (
            <PopUpLoad />
        )
    }else{
        return (
            <div className="h-full">
                <div className="h-[200px] md:h-[260px]"> {/* DIV A */}
                    <div className="fixed h-[100px] md:h-[140px] bg-basic-blue w-full">
                        <div className="flex items-center justify-center mt-12 md:mt-16">
                            <UserIcon
                                fullName={session.user.fullName}
                                src={session.user.profileImage}
                                size="profile"
                            />
                        </div>
                        <div className="text-center mb-4">
                            <p className="text-lg md:text-xl font-bold leading-5">{session.user.fullName}</p>
                            <p className="text-sm md:text-base mt-1">Joined at</p>
                        </div>
                    </div>
                </div>
                <div className="container flex-grow flex flex-col justify-center"> {/* DIV A */}
                    <div className="overflow-auto">
                        {updateProfile && (
                            <div className="max-w-2xl m-auto">
                                <UpdateProfileForm 
                                    initialValues={initialValues} 
                                    setUpdateProfile={setUpdateProfile} 
                                    handleUpdateProfile={handleUpdateProfile} 
                                />
                            </div>
                        )}
                        {!updateProfile && (
                            <div className="max-w-2xl m-auto">
                                <div className="overflow-auto h-1/4 md:h-full flex flex-col gap-4">
                                    <ProfileField
                                        icon={<IoIosInformationCircle className="text-lg md:text-xl"/>}
                                        label={"Description"}
                                        value={"No description yet."}
                                    />
                                    <ProfileField
                                        icon={<MdEmail className="text-lg md:text-xl"/>}
                                        label={"Email"}
                                        value={session.user.email}
                                    />
                                    <ProfileField
                                        icon={<TbBriefcaseFilled className="text-lg md:text-xl"/>}
                                        label={"Job Position"}
                                        value={"No job position yet."}
                                    />
                                    <ProfileField
                                        icon={<IoMdPin className="text-lg md:text-xl"/>}
                                        label={"Location"}
                                        value={"No location yet."}
                                    />
                                </div>
                                <div className="mt-4 md:mt-6 text-center xs:text-left">
                                    <p className="text-base md:text-lg font-semibold">Manage Account</p>
                                    <div className="flex flex-col xs:flex-row gap-2 md:gap-4 mt-2 md:mt-4 mb-12">
                                        <Button variant="primary" onClick={() => setChangePassword(true)}>Change Password</Button>
                                        <Button variant="primary" outline onClick={() => setUpdateProfile(true)}>Update Profile</Button>
                                        <Button variant="danger" outline onClick={() => setDeleteAccount(true)}>Delete Account</Button>
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
            </div>
        )
    }
}