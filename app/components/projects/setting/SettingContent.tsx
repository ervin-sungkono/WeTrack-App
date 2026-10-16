"use client"

import SettingForm from "../../common/form/project/SettingForm"

type SettingContentProps = { projectId: string }

export default function SettingContent({ projectId }: SettingContentProps){

    return (
        <SettingForm projectId={projectId}/>
    )
}
