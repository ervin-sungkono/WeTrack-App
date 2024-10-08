/* eslint-disable react/no-children-prop */
"use client"

import { useSession, signOut } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { CgProfile } from "react-icons/cg";
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "../common/button/Button"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useEffect, useState, useRef } from "react"
import ChangePasswordForm from "../common/form/profile/ChangePasswordForm"
import DeleteAccountForm from "../common/form/profile/DeleteAccountForm"
import UpdateProfileForm from "../common/form/profile/UpdateProfileForm"
import { getUserProfile, updateUserProfile, deleteUserImageProfile, deleteUserProfile, changeUserPassword } from "@/app/lib/fetch/user"
import { dateFormat } from "@/app/lib/date"
import { useRouter } from "next/navigation";
import PopUpInfo from "../common/alert/PopUpInfo";

export default function ProfileLayout(){
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(true)
    const [changePassword, setChangePassword] = useState(false)
    const [successChangePassword, setSuccessChangePassword] = useState(false)
    const [updateProfile, setUpdateProfile] = useState(false)
    const [successUpdateProfile, setSuccessUpdateProfile] = useState(false)
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [successDeleteAccount, setSuccessDeleteAccount] = useState(false)

    const [initialValues, setInitialValues] = useState({
        fullName: "",
        email: "",
        description: "",
        jobPosition: "",
        location: "",
        createdAt: null
    })

    useEffect(() => {
        getUserProfile().then(res => {
            if(res.error){
                console.log(res.error)
            }else{
                const createdDate = dateFormat(res.data.createdAt.seconds)
                setInitialValues({
                    fullName: res.data.fullName,
                    email: res.data.email,
                    description: res.data.description || "",
                    jobPosition: res.data.jobPosition || "",
                    location: res.data.location || "",
                    createdAt: createdDate,
                })
                if(res.data.profileImage){
                    setOriginalProfileImageFile(res.data.profileImage)
                    setOriginalProfileImage(res.data.profileImage.attachmentStoragePath)
                    setProfileImageUploadedURL(res.data.profileImage.attachmentStoragePath)
                }  
            }
            setLoading(false)
        }).catch(error => {
            console.log(error)
        })
    }, [])

    const ProfileField = ({icon, label, value, nullValue}) => {
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
                        <div className={`w-full rounded-md bg-transparent text-xs md:text-sm ${nullValue ? "italic" : ""}`}>
                            {value}
                        </div>
                    </div>
                </div>
            </div>
        )             
    }

    const imageUploaderRef = useRef()
    const [originalProfileImageFile, setOriginalProfileImageFile] = useState(null)
    const [originalProfileImage, setOriginalProfileImage] = useState(null)
    const [profileImageUploadError, setProfileImageUploadError] = useState(false)
    const [profileImageUploaded, setProfileImageUploaded] = useState(null)
    const [profileImageUploadedURL, setProfileImageUploadedURL] = useState(null)
    const [profileImageDeleted, setProfileImageDeleted] = useState(false)

    const openImageUpload = () => {
        imageUploaderRef.current.click()
    }

    const deleteImageUpload = () => {
        setProfileImageUploaded(null)
        setProfileImageUploadedURL(null)
        setProfileImageDeleted(true)
    }

    const handleImageUpload = (e) => {
        if(e.target.files.length > 0){
            if(e.target.files[0].size > 2097152){
                setProfileImageUploadError(true)
                return
            }
            setProfileImageUploaded(e.target.files[0])
            setProfileImageUploadedURL(URL.createObjectURL(e.target.files[0]))
            setProfileImageDeleted(false)
        }else{
            return
        }
    }

    const ProfileImageField = () => {
        return (
            <div className="flex gap-3">
                <div>
                    <CgProfile className="text-xl md:text-2xl" />
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="profileImage" className="block font-semibold text-xs md:text-sm text-dark-blue">
                        Foto Profil
                    </label>
                    <div className="relative flex items-center">
                        <Button variant="danger" outline onClick={deleteImageUpload} disabled={profileImageUploadedURL == null || originalProfileImageFile == null}>
                            Hapus Foto Profil
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const handleChangePassword = async (values, { setFieldError }) => {
        setLoading(true);
        try{
            const res = await changeUserPassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            })
            if(res.error){
                console.log(res.error)
            }else{
                setSuccessChangePassword(true)
            }
        }catch(error){
            if(error.message.includes("auth/invalid-credential")){
                setFieldError("oldPassword", "Kata sandi lama yang Anda masukkan tidak sesuai dengan kredensial Anda!")
            }else if(error.message.includes("auth/too-many-requests")){
                setFieldError("oldPassword", "Terlalu banyak percobaan yang gagal, coba lagi nanti!")
            }
        }finally{
            setLoading(false);
        }
    }

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        const formData = new FormData()
        formData.enctype = "multipart/form-data"
        formData.append("fullName", values.fullName)
        formData.append("email", values.email)
        if(profileImageUploaded != null){
            formData.append("profileImage", profileImageUploaded)
        }
        formData.append("description", values.description)
        formData.append("jobPosition", values.jobPosition)
        formData.append("location", values.location)
        try {
            const res = await updateUserProfile(formData)
            if(res.error){
                console.log(JSON.parse(res.error).errors)
            }else{
                if(profileImageDeleted){
                    try {
                        const imageDeleteRes = await deleteUserImageProfile()
                        if(imageDeleteRes.error){
                            console.log(imageDeleteRes.error)
                        }else{
                            setSuccessUpdateProfile(true)
                        }
                    }catch(error){
                        console.log(error)
                    }
                }else{
                    setSuccessUpdateProfile(true)
                }
                await update({ 
                    fullName: res.data.fullName, 
                    profileImage: profileImageDeleted ? null : res.data.profileImage 
                })
            }
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    const handleDeleteAccount = () => {
        setSuccessDeleteAccount(true)
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
                            {updateProfile ? (
                                <div className="group relative">
                                    <div className="group-hover:brightness-75 cursor-pointer" onClick={openImageUpload}>
                                        <UserIcon
                                            fullName={initialValues.fullName}
                                            src={profileImageUploadedURL}
                                            size="profile"
                                        />
                                    </div>
                                    <div className="hidden group-hover:block absolute top-9 text-center text-white cursor-pointer" onClick={openImageUpload}>Ganti Foto Profil</div>
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
                            ) : (
                                <div>
                                    <UserIcon
                                        fullName={initialValues.fullName}
                                        src={profileImageUploadedURL}
                                        size="profile"
                                    />
                                </div>
                            )}
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
                            <div className="flex flex-col gap-4 max-w-2xl m-auto">
                                <ProfileImageField />
                                <UpdateProfileForm 
                                    initialValues={initialValues} 
                                    setUpdateProfile={setUpdateProfile}
                                    profileImageUploaded={profileImageUploaded}
                                    setProfileImageUploaded={setProfileImageUploaded}
                                    setProfileImageUploadedURL={setProfileImageUploadedURL}
                                    profileImageDeleted={profileImageDeleted}
                                    setProfileImageDeleted={setProfileImageDeleted}
                                    originalProfileImage={originalProfileImage}
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
                                        value={initialValues.description || "Anda belum mengisi deskripsi."}
                                        nullValue={initialValues.description === ""}
                                    />
                                    <ProfileField
                                        icon={<MdEmail className="text-lg md:text-xl"/>}
                                        label={"Email"}
                                        value={initialValues.email}
                                    />
                                    <ProfileField
                                        icon={<TbBriefcaseFilled className="text-lg md:text-xl"/>}
                                        label={"Posisi Pekerjaan"}
                                        value={initialValues.jobPosition || "Anda belum mengisi posisi pekerjaan."}
                                        nullValue={initialValues.jobPosition === ""}
                                    />
                                    <ProfileField
                                        icon={<IoMdPin className="text-lg md:text-xl"/>}
                                        label={"Lokasi"}
                                        value={initialValues.location || "Anda belum mengisi lokasi."}
                                        nullValue={initialValues.location === ""}
                                    />
                                </div>
                                <div className="mt-4 md:mt-6 text-center xs:text-left">
                                    <p className="text-base md:text-lg font-semibold">Kelola Akun</p>
                                    <div className="flex flex-col xs:flex-row gap-2 md:gap-4 mt-2 md:mt-4 mb-12">
                                        <Button variant="primary" onClick={() => {
                                            setChangePassword(true)
                                        }}>
                                            Ganti Kata Sandi
                                        </Button>
                                        <Button variant="primary" outline onClick={() => {
                                            setUpdateProfile(true)
                                        }}>
                                            Perbarui Profil
                                        </Button>
                                        <Button variant="danger" outline onClick={() => {
                                            setDeleteAccount(true)
                                        }}>
                                            Hapus Akun
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {profileImageUploadError && (
                    <PopUpInfo
                        title={"Foto Profil Tidak Terunggah"}
                        titleSize={"default"}
                        message={"Foto profil tidak boleh melebihi 2 MB, silakan coba lagi dengan foto lain!"}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setProfileImageUploadError(false)
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                )}
                {changePassword && (
                    <ChangePasswordForm
                        onConfirm={handleChangePassword}
                        onClose={() => setChangePassword(false)}
                    />
                )}
                {successChangePassword &&
                    <PopUpInfo
                        title={"Kata Sandi Diperbarui"}
                        titleSize={"default"}
                        message={"Kata sandi Anda telah berhasil diperbarui."}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setSuccessChangePassword(false)
                                location.reload()
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                }
                {deleteAccount && (
                    <DeleteAccountForm
                        onConfirm={handleDeleteAccount}
                        onClose={() => setDeleteAccount(false)}
                    />
                )}
                {successDeleteAccount &&
                    <PopUpInfo
                        title={"Akun Dihapus"}
                        titleSize={"default"}
                        message={"Akun Anda telah dihapus. Anda akan dialihkan ke halaman masuk."}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setSuccessDeleteAccount(false)
                                signOut()
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                }
                {successUpdateProfile &&
                    <PopUpInfo
                        title={"Profil Diperbarui"}
                        titleSize={"default"}
                        message={"Profil Anda telah berhasil diperbarui."}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setSuccessUpdateProfile(false)
                                location.reload()
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                }
                {loading && (
                    <PopUpLoad />
                )}
            </div>
        )
    }
}