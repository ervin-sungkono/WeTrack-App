"use client"

import { useSession, signOut } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { CgProfile } from "react-icons/cg"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "../common/button/Button"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useEffect, useState, useRef, type ChangeEvent } from "react"
import type { FormikHelpers } from "formik"
import ChangePasswordForm from "../common/form/profile/ChangePasswordForm"
import DeleteAccountForm from "../common/form/profile/DeleteAccountForm"
import UpdateProfileForm from "../common/form/profile/UpdateProfileForm"
import { getUserProfile, updateUserProfile, deleteUserImageProfile, changeUserPassword } from "@/app/lib/fetch/user"
import { dateFormat } from "@/app/lib/date"
import PopUpInfo from "../common/alert/PopUpInfo"
import ProfileField from "./ProfileField"
import type { ProfileFormValues } from "../common/form/profile/UpdateProfileForm"
import type { ChangePasswordFormValues } from "@/app/lib/schema"
import type { ProfileImage } from "@/app/types/auth"

function ProfileImageField({ disabled, onDelete }: { disabled: boolean; onDelete: () => void }) {
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
                    <Button variant="danger" outline onClick={onDelete} disabled={disabled}>
                        Hapus Foto Profil
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ProfileLayout(){
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(true)
    const [changePassword, setChangePassword] = useState(false)
    const [successChangePassword, setSuccessChangePassword] = useState(false)
    const [updateProfile, setUpdateProfile] = useState(false)
    const [successUpdateProfile, setSuccessUpdateProfile] = useState(false)
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [successDeleteAccount, setSuccessDeleteAccount] = useState(false)

    const [initialValues, setInitialValues] = useState<ProfileFormValues>({
        fullName: "",
        email: "",
        description: "",
        jobPosition: "",
        location: "",
        createdAt: null,
    })
    const imageUploaderRef = useRef<HTMLInputElement>(null)
    const [originalProfileImageFile, setOriginalProfileImageFile] = useState<ProfileImage>(null)
    const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null)
    const [profileImageUploadError, setProfileImageUploadError] = useState(false)
    const [profileImageUploaded, setProfileImageUploaded] = useState<File | null>(null)
    const [profileImageUploadedURL, setProfileImageUploadedURL] = useState<string | null>(null)
    const [profileImageDeleted, setProfileImageDeleted] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        void getUserProfile()
            .then((res) => {
                if (!active) return
                const profile = res.data
                if (!profile) {
                    setProfileError(res.message ?? "Profil tidak dapat dimuat.")
                    return
                }
                const image = profile.profileImage
                setInitialValues({
                    fullName: profile.fullName,
                    email: profile.email,
                    description: profile.description ?? "",
                    jobPosition: profile.jobPosition ?? "",
                    location: profile.location ?? "",
                    createdAt: dateFormat(profile.createdAt ?? null),
                })
                setOriginalProfileImageFile(image)
                setOriginalProfileImage(image?.attachmentStoragePath ?? null)
                setProfileImageUploadedURL(image?.attachmentStoragePath ?? null)
            })
            .catch((error: unknown) => {
                if (active) setProfileError(error instanceof Error ? error.message : "Profil tidak dapat dimuat.")
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [])

    useEffect(() => () => {
        if (profileImageUploadedURL?.startsWith("blob:")) URL.revokeObjectURL(profileImageUploadedURL)
    }, [profileImageUploadedURL])

    const openImageUpload = () => {
        imageUploaderRef.current?.click()
    }

    const deleteImageUpload = () => {
        setProfileImageUploaded(null)
        setProfileImageUploadedURL(null)
        setProfileImageDeleted(Boolean(originalProfileImageFile))
    }

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            setProfileImageUploadError(true)
            event.currentTarget.value = ""
            return
        }
        setProfileImageUploaded(file)
        setProfileImageUploadedURL(URL.createObjectURL(file))
        setProfileImageDeleted(false)
    }

    const handleChangePassword = async (values: ChangePasswordFormValues, { setFieldError }: FormikHelpers<ChangePasswordFormValues>) => {
        setLoading(true);
        try{
            const res = await changeUserPassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            })
            if(res.success){
                setSuccessChangePassword(true)
            }
        }catch(error){
            const message = error instanceof Error ? error.message : ""
            if(message.includes("auth/invalid-credential") || message.toLowerCase().includes("current password is incorrect")){
                setFieldError("oldPassword", "Kata sandi lama yang Anda masukkan tidak sesuai dengan kredensial Anda!")
            }else if(message.includes("auth/too-many-requests")){
                setFieldError("oldPassword", "Terlalu banyak percobaan yang gagal, coba lagi nanti!")
            } else {
                setProfileError("Kata sandi tidak dapat diperbarui saat ini. Silakan coba lagi.")
            }
        }finally{
            setLoading(false);
        }
    }

    const handleUpdateProfile = async (values: ProfileFormValues) => {
        setLoading(true);
        const formData = new FormData()
        formData.append("fullName", values.fullName)
        if(profileImageUploaded != null){
            formData.append("profileImage", profileImageUploaded)
        }
        formData.append("description", values.description ?? "")
        formData.append("jobPosition", values.jobPosition ?? "")
        formData.append("location", values.location ?? "")
        try {
            const res = await updateUserProfile(formData)
            if(!res.data){
                setProfileError(res.message ?? "Profil tidak dapat diperbarui.")
            }else{
                if(profileImageDeleted){
                    await deleteUserImageProfile()
                }
                await update({
                    fullName: res.data.fullName,
                    profileImage: profileImageDeleted ? null : res.data.profileImage
                })
                setSuccessUpdateProfile(true)
            }
        }catch(error){
            setProfileError(error instanceof Error ? error.message : "Profil tidak dapat diperbarui.")
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
                                <ProfileImageField
                                    onDelete={deleteImageUpload}
                                    disabled={profileImageUploadedURL == null || (originalProfileImageFile == null && profileImageUploaded == null)}
                                />
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
                {profileError && (
                    <PopUpInfo title="Terjadi Kesalahan" message={profileError}>
                        <div className="flex justify-end">
                            <Button onClick={() => setProfileError(null)} className="w-24 md:w-32">OK</Button>
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
