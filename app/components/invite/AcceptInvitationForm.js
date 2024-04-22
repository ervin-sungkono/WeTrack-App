"use client"
import DashboardLayout from "../layout/DashboardLayout"
import Button from "../common/button/Button"
import { useSession } from "next-auth/react"

export default function AcceptInvitationForm({ projectId }){
    const { data: session, status } = useSession()

    // TODO: Verify apakah user memang diinvite untuk proyek ini, kalau iya, show formnya, kalau tidak show 404
    // TODO2: integrasikan nama project ke dalam teks deskripsi undangan

    const rejectInvitation = () => {
        console.log("reject invitation")
        // code untuk call api reject
    }

    const acceptInvitation = () => {
        console.log("accept invitation")
        // code untuk call api accept
    }

    if(status === 'loading') return null
    return(
        <DashboardLayout>
            <div className="w-full max-w-2xl flex flex-col gap-4 bg-white px-6 md:px-8 py-4 md:py-6 rounded-md shadow-md m-auto">
                <div className="flex flex-col gap-1.5">
                    <div className="text-lg md:text-2xl font-bold text-dark-blue">Terima Undangan</div>
                    <p className="text-xs md:text-sm text-dark-blue/80">Apakah anda ingin menerima undangan ini?</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="danger" className={"flex-grow xs:max-w-32"} onClick={rejectInvitation}>Tolak</Button>
                    <Button className={"flex-grow xs:max-w-32"} onClick={acceptInvitation}>Terima</Button>
                </div>
            </div>
        </DashboardLayout>
    )
}