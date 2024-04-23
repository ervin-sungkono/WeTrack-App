/* eslint-disable react/no-children-prop */
"use client"

import { useSession } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin, IoMdPerson } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "../common/button/Button"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useEffect, useState, useRef } from "react"
import ChangePasswordForm from "../common/form/profile/ChangePasswordForm"
import DeleteAccountForm from "../common/form/profile/DeleteAccountForm"
import UpdateProfileForm from "../common/form/profile/UpdateProfileForm"
import { getUserProfile, updateUserProfile } from "@/app/lib/fetch/user"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { dateFormat } from "@/app/lib/date"

export default function ProfileLayout(){
    const { data: session, status } = useSession()

    const [initialValues, setInitialValues] = useState({
        fullName: "",
        email: "",
        profileImage: null,
        description: "",
        jobPosition: "",
        location: "",
        createdAt: null
    })

    useEffect(() => {
        console.log(initialValues)
    }, [initialValues])

    const userProfile = async () => {
        try {
            const res = await getUserProfile()
            if(res.error){
                console.log(res.error)
            }else{
                const createdDate = dateFormat(res.data.createdAt.seconds)
                setInitialValues({
                    fullName: res.data.fullName,
                    email: res.data.email,
                    profileImage: res.data.profileImage,
                    description: res.data.description,
                    jobPosition: res.data.jobPosition,
                    location: res.data.location,
                    createdAt: createdDate,
                })
            }
        }catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        userProfile()
    }, [])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [changePassword, setChangePassword] = useState(false)
    const [updateProfile, setUpdateProfile] = useState(false)
    const [deleteAccount, setDeleteAccount] = useState(false)
    const router = useRouter()

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

    const imageUploaderRef = useRef()
    const [profileImageUploaded, setProfileImageUploaded] = useState(null)

    const openImageUpload = () => {
        imageUploaderRef.current.click()
    }

    const deleteImageUpload = () => {
        setProfileImageUploaded(null)
    }

    const handleImageUpload = (e) => {
        setProfileImageUploaded(e.target.files[0])
    }

    const ProfileImageField = () => {
        return (
            <div className="flex gap-3">
                <div>
                    <IoMdPerson className="text-xl md:text-2xl" />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="profileImage" className="block font-semibold text-xs md:text-sm text-dark-blue">
                        Foto Profil
                    </label>
                    <div className="relative flex items-center">
                        <Button variant="danger" outline onClick={deleteImageUpload} disabled={!profileImageUploaded}>
                            Hapus Foto Profil
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const handleChangePassword = async (values) => {
        setError(false);
        setLoading(true);
    }

    const handleUpdateProfile = async (values) => {
        setError(false);
        setLoading(true);
        const formData = new FormData()
        formData.append("fullName", values.fullName)
        formData.append("email", values.email)
        formData.append("profileImage", profileImageUploaded)
        formData.append("description", values.description)
        formData.append("jobPosition", values.jobPosition)
        formData.append("location", values.location)
        try {
            const res = await updateUserProfile(formData)
            if(res.error){
                setError(true);
                console.log(JSON.parse(res.error).errors)
            }else{
                router.refresh()
            }
        }catch(error){
            setError(true);
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    const handleDeleteAccount = async () => {
        setError(false);
        setLoading(true);
    }
    
    if(!session){
        return (
            <PopUpLoad />
        )
    }else{
        return (
            <div className="h-full">
                <div className="h-[200px] md:h-[260px]"> 
                    <div className="h-[100px] md:h-[140px] bg-gradient-to-r from-basic-blue to-light-blue w-full">
                        <div className="flex items-center justify-center pt-12 md:pt-16">
                            <div className="relative cursor-pointer" onClick={openImageUpload}>
                                {profileImageUploaded !== null ? (
                                    <Image
                                        src={URL.createObjectURL(profileImageUploaded)}
                                        alt={initialValues.fullName}
                                        width={112}
                                        height={112}
                                        className="rounded-full border-4 border-white hover:opacity-75"
                                    />
                                ) : (
                                    <div className="hover:opacity-75">
                                        <UserIcon
                                            fullName={initialValues.fullName}
                                            src={initialValues.profileImage}
                                            size="profile"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    id="profileImage"
                                    name="profileImage"
                                    ref={imageUploaderRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="text-center my-4">
                            <p className="text-lg md:text-xl font-bold leading-5">{initialValues.fullName}</p>
                            <p className="text-sm md:text-base mt-1">Bergabung pada {initialValues.createdAt}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 container flex-grow flex flex-col justify-center"> 
                    <div className="overflow-auto">
                        {updateProfile && (
                            <div className="flex flex-col gap-8 max-w-2xl m-auto">
                                <ProfileImageField />
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
                                        label={"Deskripsi"}
                                        value={"Belum ada deskripsi."}
                                    />
                                    <ProfileField
                                        icon={<MdEmail className="text-lg md:text-xl"/>}
                                        label={"Email"}
                                        value={session.user.email}
                                    />
                                    <ProfileField
                                        icon={<TbBriefcaseFilled className="text-lg md:text-xl"/>}
                                        label={"Posisi Pekerjaan"}
                                        value={"Belum ada posisi pekerjaan."}
                                    />
                                    <ProfileField
                                        icon={<IoMdPin className="text-lg md:text-xl"/>}
                                        label={"Lokasi"}
                                        value={"Belum ada lokasi."}
                                    />
                                </div>
                                <div className="mt-4 md:mt-6 text-center xs:text-left">
                                    <p className="text-base md:text-lg font-semibold">Kelola Akun</p>
                                    <div className="flex flex-col xs:flex-row gap-2 md:gap-4 mt-2 md:mt-4 mb-12">
                                        <Button variant="primary" onClick={() => setChangePassword(true)}>Ganti Kata Sandi</Button>
                                        <Button variant="primary" outline onClick={() => setUpdateProfile(true)}>Perbarui Profil</Button>
                                        <Button variant="danger" outline onClick={() => setDeleteAccount(true)}>Hapus Akun</Button>
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