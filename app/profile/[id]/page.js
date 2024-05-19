"use client"

import ProfileViewLayout from "@/app/components/profile/ProfileView";
import MainLayout from "@/app/components/layout/MainLayout";
import { SessionProvider } from "next-auth/react";

export default function ProfilePage({ params: { id }}){
    return (
        <SessionProvider>
            <MainLayout hideMenu={false}>
                <ProfileViewLayout userId={id}/>
            </MainLayout>
        </SessionProvider>
    )
}