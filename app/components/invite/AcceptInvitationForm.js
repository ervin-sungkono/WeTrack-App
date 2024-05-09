"use client"
import Button from "../common/button/Button"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { validateTeamMember } from "@/app/lib/fetch/team"
import { IoClose } from "react-icons/io5"
import { acceptInvite, rejectInvite } from "@/app/lib/fetch/invite"

export default function AcceptInvitationForm({ teamId }){
    const searchParams = useSearchParams()
    const [authorized, setAuthorized] = useState(true)
    const [rejected, setRejected] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        validateTeamMember({ projectId: searchParams.get('projectId'), teamId: teamId})
            .then(res => {
                if(!res.success) setAuthorized(false)
            })
    }, [searchParams, teamId])

    const rejectInvitation = async() => {
        setLoading(true)
        const res = await rejectInvite({ projectId: searchParams.get('projectId') })

        if(res.success){
            setRejected(true)
        }
        setLoading(false)
    }

    const acceptInvitation = async() => {
        setLoading(true)
        const res = await acceptInvite({ projectId: searchParams.get('projectId') })

        if(res.success){
            setAccepted(true)
        }
        setLoading(false)
    }

    if(!authorized) return(
        <div className="w-full h-screen flex flex-col justify-center items-center px-6 pb-8">
            <IoClose size={128} className="text-danger-red"/>
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Link undangan tidak dapat digunakan.</p>
        </div>
    )
    if(rejected) return(
        <div className="w-full h-screen flex flex-col justify-center items-center px-6 pb-8">
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Undangan telah berhasil ditolak</p>
        </div>
    )
    if(accepted) return(
        <div className="w-full h-screen flex flex-col justify-center items-center px-6 pb-8">
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Undangan telah berhasil diterima</p>
        </div>
    )

    return(
        <div className="w-full h-screen flex justify-center items-center px-6 pb-8">
            <div className="w-full max-w-2xl flex flex-col gap-4 bg-white px-6 md:px-8 py-4 md:py-6 rounded-md shadow-md m-auto">
                <div className="flex flex-col gap-1.5">
                    <div className="text-lg md:text-2xl font-bold text-dark-blue">Terima Undangan</div>
                    <p className="text-xs md:text-sm text-dark-blue/80">Apakah Anda ingin menerima undangan dari {searchParams.get('senderName')} untuk bergabung di proyek <b>{searchParams.get('projectName')}</b>?</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button disabled={loading} variant="danger" className={"flex-grow xs:max-w-32"} onClick={rejectInvitation}>Tolak</Button>
                    <Button disabled={loading} className={"flex-grow xs:max-w-32"} onClick={acceptInvitation}>Terima</Button>
                </div>
            </div>
        </div>
    )
}