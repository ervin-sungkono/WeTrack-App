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
import FormikField from "../common/form/formik/FormikField"

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
            <div className="flex gap-3">
                <div>
                    {icon}
                </div>
                    <div className="flex flex-col gap-1 w-full">
                        <p className="block font-semibold text-xs md:text-sm">
                            {label}
                        </p>
                        <div className="relative flex items-center">
                            <div className={`w-full rounded-md bg-transparent text-sm`}>
                                {value}
                            </div>
                        </div>
                    </div>
            </div>
        )             
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
                    <div className="mt-52 md:mt-64 overflow-auto sm:overflow-hidden">
                        {updateProfile && (
                            <UpdateProfileForm 
                                initialValues={initialValues} 
                                setUpdateProfile={setUpdateProfile} 
                                handleUpdateProfile={handleUpdateProfile} 
                            />
                        )}
                        {!updateProfile && (
                            <div>
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
                                <div className="mt-4 text-center md:text-left">
                                    <p className="text-md md:text-lg font-bold">Manage Account</p>
                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-3 md:mt-4">
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
            </>
        )
    }
}