/* eslint-disable react/no-children-prop */
"use client"

import { useSession } from "next-auth/react"
import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import UserIcon from "../common/UserIcon"
import PopUpLoad from "../common/alert/PopUpLoad"
import { useEffect, useState } from "react"
import { getUserProfileById } from "@/app/lib/fetch/user"
import { dateFormat } from "@/app/lib/date"

export default function ProfileViewLayout({userId}){
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [profileImageURL, setProfileImageURL] = useState(null)

    const [values, setValues] = useState({
        fullName: "",
        email: "",
        description: "",
        jobPosition: "",
        location: "",
        createdAt: null
    })

    useEffect(() => {
        getUserProfileById(userId).then(res => {
            if(res.error){
                console.log(res.error)
            }else{
                const createdDate = dateFormat(res.data.createdAt.seconds)
                setValues({
                    fullName: res.data.fullName,
                    email: res.data.email,
                    description: res.data.description || "",
                    jobPosition: res.data.jobPosition || "",
                    location: res.data.location || "",
                    createdAt: createdDate,
                })
                if(res.data.profileImage){
                    setProfileImageURL(res.data.profileImage.attachmentStoragePath)
                }  
            }
            setLoading(false)
        })
    }, [userId])

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
                                    icon={<MdEmail className="text-lg md:text-xl"/>}
                                    label={"Email"}
                                    value={values.email}
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