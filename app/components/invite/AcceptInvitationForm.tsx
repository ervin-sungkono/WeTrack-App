"use client"
import Button from "../common/button/Button"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { validateTeamMember } from "@/app/lib/fetch/team"
import { IoClose } from "react-icons/io5"
import { acceptInvite, rejectInvite } from "@/app/lib/fetch/invite"
import PopUpLoad from "../common/alert/PopUpLoad"

interface AcceptInvitationFormProps {
    teamId: string
}

export default function AcceptInvitationForm({ teamId }: AcceptInvitationFormProps){
    const searchParams = useSearchParams()
    const [authorized, setAuthorized] = useState(false)
    const [rejected, setRejected] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(true)

    const router = useRouter()
    const projectId = searchParams.get('projectId')

    useEffect(() => {
        let active = true
        const validate = async(validProjectId: string) => {
            try{
                const res = await validateTeamMember({ projectId: validProjectId, teamId })

                if(active) setAuthorized(Boolean(res.success))
            }catch(e){
                console.log(e)
            }finally{
                if(active) setLoading(false)
            }
        }
        if(projectId && teamId){
            void validate(projectId)
        }
        return () => { active = false }
    }, [projectId, teamId])

    useEffect(() => {
        if(accepted && projectId) router.replace(`/projects/${projectId}`)
    }, [accepted, projectId, router])

    const rejectInvitation = async() => {
        if(!projectId) return
        setLoading(true)
        try{
            const res = await rejectInvite({ projectId, teamId })

            if(res.success){
                setRejected(true)
            }
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }

    const acceptInvitation = async() => {
        if(!projectId) return
        setLoading(true)
        try{
            const res = await acceptInvite({ projectId, teamId })

            if(res.success){
                setAccepted(true)
            }
        }catch(e){
            console.log(e)
        }finally{
            setLoading(false)
        }
    }

    if((!projectId || !teamId || !authorized) && !loading) return(
        <div className="w-full h-full flex flex-col justify-center items-center px-6 pb-8">
            <IoClose size={128} className="text-danger-red"/>
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Link undangan tidak dapat digunakan!</p>
        </div>
    )
    if(rejected) return(
        <div className="w-full h-full flex flex-col justify-center items-center px-6 pb-8">
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Anda telah menolak undangan ini.</p>
        </div>
    )
    if(accepted) return(
        <div className="w-full h-full flex flex-col justify-center items-center px-6 pb-8">
            <p className="text-sm md:text-base text-dark-blue/80 text-center">Anda telah menerima undangan ini.</p>
        </div>
    )

    return(
        <div className="w-full h-full flex justify-center items-center px-6 pb-8">
            {loading && <PopUpLoad/>}
            <div className="w-full max-w-2xl flex flex-col gap-4 bg-white px-6 md:px-8 py-4 md:py-6 rounded-md shadow-md m-auto">
                <div className="flex flex-col gap-1.5">
                    <div className="text-lg md:text-2xl font-bold text-dark-blue">Terima Undangan</div>
                    <p className="text-xs md:text-sm text-dark-blue/80">Apakah Anda ingin menerima undangan dari {searchParams.get('senderName')} untuk bergabung dalam proyek <b>{searchParams.get('projectName')}</b>?</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button disabled={loading} variant="danger" className={"flex-grow xs:max-w-32"} onClick={rejectInvitation}>Tolak</Button>
                    <Button disabled={loading} className={"flex-grow xs:max-w-32"} onClick={acceptInvitation}>Terima</Button>
                </div>
            </div>
        </div>
    )
}
