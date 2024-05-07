"use client"

import ProfileViewLayout from "@/app/components/profile/ProfileView";
import MainLayout from "@/app/components/layout/MainLayout";

export default function ProfilePage({ params: { id }}){
    return (
        <MainLayout hideMenu={false}>
            <ProfileViewLayout userId={id}/>
        </MainLayout>
    )
}