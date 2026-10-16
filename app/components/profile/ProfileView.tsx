"use client"

import { useSession } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { TbBriefcaseFilled } from "react-icons/tb"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useEffect, useState } from "react"
import { getUserProfileById } from "@/app/lib/fetch/user"
import { dateFormat } from "@/app/lib/date"
import { useRouter } from "next/navigation"
import ProfileField from "./ProfileField"

type ProfileViewProps = { userId: string }
type ProfileViewValues = {
    fullName: string
    description: string
    jobPosition: string
    location: string
    createdAt: string | null
}

export default function ProfileViewLayout({userId}: ProfileViewProps){
    const { data: session, status } = useSession()
    const sessionId = session?.user.uid
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profileImageURL, setProfileImageURL] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const [values, setValues] = useState<ProfileViewValues>({
        fullName: "",
        description: "",
        jobPosition: "",
        location: "",
        createdAt: null
    })

    useEffect(() => {
        if (status === "loading") return
        if (!sessionId) {
            router.replace("/login")
            return
        }
        if(sessionId === userId){
            router.replace("/profile")
            return
        }
        let active = true
        void getUserProfileById(userId)
            .then((res) => {
                if (!active) return
                const profile = res.data
                if (!profile) {
                    setErrorMessage(res.message ?? "Profil tidak ditemukan.")
                    return
                }
                setValues({
                    fullName: profile.fullName,
                    description: profile.description ?? "",
                    jobPosition: profile.jobPosition ?? "",
                    location: profile.location ?? "",
                    createdAt: dateFormat(profile.createdAt ?? null),
                })
                const image = profile.profileImage
                setProfileImageURL(image?.attachmentStoragePath ?? null)
            })
            .catch((error: unknown) => {
                if (active) setErrorMessage(error instanceof Error ? error.message : "Profil tidak ditemukan.")
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [router, sessionId, status, userId])

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
                            <UserIcon
                                fullName={values.fullName}
                                src={profileImageURL}
                                size="profile"
                            />
                        </div>
                        <div className="text-center my-4">
                            <p className="text-lg md:text-xl font-bold leading-5">{values.fullName}</p>
                            <p className="text-sm md:text-base mt-1">Bergabung pada {values.createdAt}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 container flex-grow flex flex-col justify-center">
                    <div className="overflow-auto">
                        <div className="max-w-2xl m-auto">
                            <div className="overflow-auto h-1/4 md:h-full flex flex-col gap-4">
                                <ProfileField
                                    icon={<IoIosInformationCircle className="text-lg md:text-xl"/>}
                                    label={"Deskripsi"}
                                    value={values.description || "Deskripsi belum diatur oleh pengguna."}
                                    nullValue={values.description === ""}
                                />
                                <ProfileField
                                    icon={<TbBriefcaseFilled className="text-lg md:text-xl"/>}
                                    label={"Posisi Pekerjaan"}
                                    value={values.jobPosition || "Posisi pekerjaan belum diatur oleh pengguna."}
                                    nullValue={values.jobPosition === ""}
                                />
                                <ProfileField
                                    icon={<IoMdPin className="text-lg md:text-xl"/>}
                                    label={"Lokasi"}
                                    value={values.location || "Lokasi belum diatur oleh pengguna."}
                                    nullValue={values.location === ""}
                                />
                            </div>
                            {errorMessage && <p role="alert" className="text-center text-sm text-danger-red">{errorMessage}</p>}
                        </div>
                    </div>
                </div>
                {loading && (
                    <PopUpLoad />
                )}
            </div>
        )
    }
}
