"use client"
import { useEffect, useState } from "react"
import { useFormikContext } from "formik"
import UserSelectButton from "../../UserSelectButton"
import { getAllTeamMember } from "@/app/lib/fetch/team"
import type { Session } from "next-auth"
import type { CreateTaskFormValues } from "@/app/types/ui"

type SelectAssigneeOptionProps = { session: Session }
type AssigneeOption = { user: { id: string; fullName: string; profileImage?: { attachmentStoragePath?: string | null } | string | null } }

export default function SelectAssigneeOption({ session }: SelectAssigneeOptionProps){
    const { values: { projectId }, setFieldValue } = useFormikContext<CreateTaskFormValues>()
    const [teamOptions, setTeamOptions] = useState<AssigneeOption[]>([])

    useEffect(() => {
        const fetchTeamOptions = async() => {
            if(!projectId) return
            const teamData = await getAllTeamMember({ projectId, excludeViewer: true })
            if(teamData.data){
                setTeamOptions(teamData.data.flatMap(({ user }) => (
                    user?.id && user.fullName
                        ? [{ user: { id: user.id, fullName: user.fullName, profileImage: user.profileImage } }]
                        : []
                )))
            }
        }
        fetchTeamOptions()
    }, [projectId])

    const handleAssigneeChange = (value: { id?: string }) => {
        setFieldValue('assignedTo', value.id)
    }
    return(
        <div className="w-full flex flex-col gap-2">
            <label htmlFor="assignedTo" className="block font-semibold text-xs md:text-sm text-dark-blue">
                Penerima
            </label>
            <UserSelectButton
                name="assignedTo"
                userId={session.user.uid}
                options={teamOptions}
                onChange={handleAssigneeChange}
                disabled={!projectId}
            />
        </div>
    )
}
