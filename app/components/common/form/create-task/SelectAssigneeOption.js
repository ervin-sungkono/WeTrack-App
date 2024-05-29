"use client"
import { useEffect, useState } from "react"
import { useFormikContext } from "formik"
import UserSelectButton from "../../UserSelectButton"
import { getAllTeamMember } from "@/app/lib/fetch/team"

export default function SelectAssigneeOption({ session }){
    const { values: { projectId }, setFieldValue } = useFormikContext()
    const [teamOptions, setTeamOptions] = useState([])

    useEffect(() => {
        const fetchTeamOptions = async() => {
            if(!projectId) return
            const teamData = await getAllTeamMember({ projectId, excludeViewer: true })
            if(teamData.data){
                setTeamOptions(teamData.data)
            }
        }
        fetchTeamOptions()
    }, [projectId])

    const handleAssigneeChange = (value) => {
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