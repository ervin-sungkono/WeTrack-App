import { useSession } from "next-auth/react"

import { IoIosInformationCircle, IoMdPin } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import { TbBriefcaseFilled } from "react-icons/tb"
import Button from "./button/Button"
import UserIcon from "./UserIcon"
import LoadingIcon from "./alert/LoadingIcon"

export default function ProfileLayout(){

    const { data: session, status } = useSession()
    
    if(status === "loading"){
        return (
            <LoadingIcon />
        )
    }else{
        return (
            <>
                <div className="fixed h-32 bg-basic-blue w-full">
                    
                </div>
                <div className="container w-5/6 md:w-3/4 xl:w-3/5 flex flex-col justify-center">
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
                    <div className="mt-4">
                        <div>
                            <div className="flex items-center">
                                <IoIosInformationCircle size={24}/>
                                <p className="text-md md:text-lg font-bold ml-2">Description</p>
                            </div>
                            <p className="text-xs md:text-sm ml-8">Description</p>
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
                            <p className="text-xs md:text-sm ml-8">Job Position</p>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center">
                                <IoMdPin size={24}/>
                                <p className="text-md md:text-lg font-bold ml-2">Location</p>
                            </div>
                            <p className="text-xs md:text-sm ml-8">Location</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center md:text-left">
                        <p className="text-md md:text-lg font-bold">Manage Account</p>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 md:mt-4">
                            <Button variant="primary">Change Password</Button>
                            <Button variant="secondary">Update Profile</Button>
                            <Button variant="danger-secondary">Delete Account</Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}