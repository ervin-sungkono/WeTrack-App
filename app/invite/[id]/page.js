"use client"
import { SessionProvider } from "next-auth/react";
import AcceptInvitationForm from "@/app/components/invite/AcceptInvitationForm";

export default function InvitePage({ params: { id } }){
    return(
        <SessionProvider>
            <AcceptInvitationForm projectId={id}/>
        </SessionProvider>
    )
}