"use client"
import { use } from "react"
import AcceptInvitationForm from "@/app/components/invite/AcceptInvitationForm";
import DashboardLayout from "@/app/components/layout/DashboardLayout";

type InvitePageProps = { params: Promise<{ id: string }> }

export default function InvitePage({ params }: InvitePageProps){
    const { id } = use(params)
    return(
        <DashboardLayout>
            <AcceptInvitationForm teamId={id}/>
        </DashboardLayout>
    )
}
