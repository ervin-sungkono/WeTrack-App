"use client"

import ProfileLayout from "../components/common/Profile";
import MainLayout from "../components/layout/MainLayout";
import { SessionProvider } from "next-auth/react";

export default function ProfilePage(){

    return (
        <SessionProvider>
            <MainLayout hideMenu={false}>
                <ProfileLayout />
            </MainLayout>
        </SessionProvider>
    )
}