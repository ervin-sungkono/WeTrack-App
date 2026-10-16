"use client"

import { use } from "react";
import ProfileViewLayout from "@/app/components/profile/ProfileView";
import MainLayout from "@/app/components/layout/MainLayout";

type ProfilePageProps = { params: Promise<{ id: string }> }

export default function ProfilePage({ params }: ProfilePageProps){
    const { id } = use(params)
    return (
        <MainLayout>
            <ProfileViewLayout userId={id}/>
        </MainLayout>
    )
}
