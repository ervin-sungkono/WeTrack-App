"use client"
import { SessionProvider } from "next-auth/react";
import AcceptInvitationForm from "@/app/components/invite/AcceptInvitationForm";
import DashboardLayout from "@/app/components/layout/DashboardLayout";

export default function InvitePage({ params: { id } }){
    return(
        <SessionProvider>
            <DashboardLayout>
                <AcceptInvitationForm teamId={id}/>
            </DashboardLayout>
        </SessionProvider>
    )
}