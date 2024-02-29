/* eslint-disable react/no-children-prop */
import { useSession } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "./button/Button"
import UserIcon from "./UserIcon"
import PopUpLoad from "./alert/PopUpLoad"
import { useState } from "react"
import ChangePasswordForm from "./form/ChangePasswordForm"
import DeleteAccountForm from "./form/DeleteAccountForm"
import FormikWrapper from "./form/formik/FormikWrapper"
import { updateProfileSchema } from "@/app/lib/schema"
import FormikField from "./form/formik/FormikField"

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
    const [updateProfileConfirm, setUpdateProfileConfirm] = useState(false)
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
                <div className="fixed h-32 bg-basic-blue w-full">
                    
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
                                size="4xl"
                            />
                        </div>
                        <div className="text-center mt-2 md:mt-4">
                            <p className="text-lg md:text-xl font-bold">{session.user.fullName}</p>
                            <p className="text-xs md:text-sm">Joined at</p>
                        </div>
                    </div>
                    <div className="mt-64">
                        {updateProfile && (
                            <FormikWrapper
                                initialValues={initialValues}
                                onSubmit={handleUpdateProfile}
                                validationSchema={updateProfileSchema}
                                children={(formik) => (
                                    <div>
                                        <div className="overflow-auto h-72">
                                            <div>
                                                <div className="flex items-center">
                                                    <IoIosInformationCircle size={24}/>
                                                    <p className="text-md md:text-lg font-bold ml-2">Description</p>
                                                </div>
                                                <p className="text-xs md:text-sm ml-8">
                                                    <FormikField
                                                        name="description"
                                                        required
                                                        type="text"
                                                        placeholder="Enter description..."
                                                    />
                                                </p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <MdEmail size={24}/>
                                                    <p className="text-md md:text-lg font-bold ml-2">Email</p>
                                                </div>
                                                <p className="text-xs md:text-sm ml-8">{session.user.email}</p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <TbBriefcaseFilled size={24}/>
                                                    <p className="text-md md:text-lg font-bold ml-2">Job Position</p>
                                                </div>
                                                <p className="text-xs md:text-sm ml-8">
                                                    <FormikField
                                                        name="jobPosition"
                                                        required
                                                        type="text"
                                                        placeholder="Enter job position..."
                                                    />
                                                </p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <IoMdPin size={24}/>
                                                    <p className="text-md md:text-lg font-bold ml-2">Location</p>
                                                </div>
                                                <p className="text-xs md:text-sm ml-8">
                                                    <FormikField
                                                        name="location"
                                                        required
                                                        type="text"
                                                        placeholder="Enter location..."
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 md:mt-4">
                                            <Button variant="primary" type="submit">Confirm Update Profile</Button>
                                            <Button variant="secondary" onClick={() => setUpdateProfile(false)}>Cancel Update Profile</Button>
                                        </div>
                                    </div>
                                )}
                            />
                        )}
                        {!updateProfile && (
                            <div>
                                <div>
                                    <div className="flex items-center">
                                        <IoIosInformationCircle size={24}/>
                                        <p className="text-md md:text-lg font-bold ml-2">Description</p>
                                    </div>
                                    <p className="text-xs md:text-sm ml-8">No description yet.</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center">
                                        <MdEmail size={24}/>
                                        <p className="text-md md:text-lg font-bold ml-2">Email</p>
                                    </div>
                                    <p className="text-xs md:text-sm ml-8">{session.user.email}</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center">
                                        <TbBriefcaseFilled size={24}/>
                                        <p className="text-md md:text-lg font-bold ml-2">Job Position</p>
                                    </div>
                                    <p className="text-xs md:text-sm ml-8">No job position yet.</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center">
                                        <IoMdPin size={24}/>
                                        <p className="text-md md:text-lg font-bold ml-2">Location</p>
                                    </div>
                                    <p className="text-xs md:text-sm ml-8">No location yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 text-center md:text-left">
                        {!updateProfile && (
                            <p className="text-md md:text-lg font-bold">Manage Account</p>
                        )}
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 md:mt-4">
                            {!updateProfile && (
                                <Button variant="primary" onClick={() => setChangePassword(true)}>Change Password</Button>
                            )}
                            {!updateProfile && (
                                <Button variant="secondary" onClick={() => setUpdateProfile(true)}>Update Profile</Button>
                            )}
                            {!updateProfile && (
                                <Button variant="danger-secondary" onClick={() => setDeleteAccount(true)}>Delete Account</Button>
                            )}
                        </div>
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