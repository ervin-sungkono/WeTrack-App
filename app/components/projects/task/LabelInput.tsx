"use client"
import { useEffect, useEffectEvent, useRef, useState } from "react";
import Tags from "@/app/lib/tagify"
import LabelForm from "../../common/form/create-task/LabelForm";
import Button from "../../common/button/Button";

import { getQueryReference, getProjectRole } from "@/app/firebase/util";
import { getSession } from "next-auth/react";
import { onSnapshot } from "firebase/firestore";
import { pickTextColorBasedOnBgColor } from "@/app/lib/color";
import type { Label, ProjectRole } from "@/app/types/domain";
import type { TagifyChangeEvent, TagifySuggestion } from "@/app/lib/tagify";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";

// import { IoMdSettings as SettingsIcon } from "react-icons/io";
import { validateUserRole } from "@/app/lib/helper";

type TagifySettings = Record<string, unknown> & {
    transformTag?: (tagData: TagifySuggestion) => void
}

interface LabelInputProps {
    hideLabel?: boolean
    projectId: string
    labelData?: string | null
    onChange?: (event: TagifyChangeEvent) => void
    resetLabel?: () => void
}

export default function LabelInput({ hideLabel = false, projectId, labelData, onChange, resetLabel }: LabelInputProps){
    const [labelModal, setLabelModal] = useState(false)
    const [labels, setLabels] = useState<Label[]>([])
    const [role, setRole] = useState<ProjectRole | null>(null)
    const { authReady } = useFirebaseAuthBridge()
    const resetLabelInput = useEffectEvent(() => resetLabel?.())

    useEffect(() => {
        if(!projectId || !authReady) return

        resetLabelInput()

        const reference = getQueryReference({ collectionName: "labels", field: "projectId", id: projectId })
        let active = true
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const updatedLabels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Label[]
            if (active) setLabels(updatedLabels)
        })

        return () => { active = false; unsubscribe() }
    }, [projectId, authReady])

    useEffect(() => {
        if(!projectId || !authReady) return
        let active = true
        void getSession()
            .then(async(session) => {
                const userId = session?.user?.uid
                if (!userId) return null
                return getProjectRole({ projectId, userId })
            })
            .then((nextRole) => { if (active) setRole(nextRole) })
            .catch((error: unknown) => console.error("Failed to load project role", error))
        return () => { active = false }
    }, [projectId, authReady])

    const tagifyRef = useRef<unknown>(null)
    const tagifySettings: TagifySettings = {
        skipInvalid: true,
        userInput: false,
        maxTags: 10,
        editTags: false,
        tagTextProp: 'content',
        placeholder: "Masukkan label...",
        dropdown: {
            maxItems: 20,           // <- maximum allowed rendered suggestions
            classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
            enabled: 0,             // <- show suggestions on focus
            closeOnSelect: false,   // <- do not hide the suggestions dropdown once an item has been selected
            mapValueTo: 'content'
        },
        transformTag: (tagData: TagifySuggestion) => {
            const color = typeof tagData.tagColor === "string" ? tagData.tagColor : "#47389F"
            tagData.style = `
                --tag-bg: ${color};
                --tag-text-color: ${pickTextColorBasedOnBgColor(color)};
                --tag-hover: ${color};
                --tag-remove-btn-color: ${pickTextColorBasedOnBgColor(color)};
                --tag-remove-bg: ${color};
                --tag-remove-btn-bg--hover: ${pickTextColorBasedOnBgColor(color)};
                --tag-border-radius: 99px;
            `
        }
    }

    return(
        <div className="w-full flex flex-col gap-2">
            {!hideLabel &&
            <label htmlFor="label" className="block font-semibold text-xs md:text-sm text-dark-blue">
                Label
            </label>}
            <div className="w-full xs:items-start flex flex-col xs:flex-row gap-2">
                <Tags
                    name="label"
                    whitelist={labels.map(label => ({
                        value: label.id,
                        content: label.content,
                        tagColor: label.backgroundColor,
                        style: `background-color: ${label.backgroundColor}; color: ${pickTextColorBasedOnBgColor(label.backgroundColor)};`
                    }))}
                    tagifyRef={tagifyRef}
                    settings={tagifySettings}
                    value={labelData}
                    defaultValue={labelData}
                    onChange={onChange}
                />
                {validateUserRole({ userRole: role, minimumRole: 'Owner' }) &&
                <Button variant="primary" onClick={() => setLabelModal(true)}>
                    <p>Pengaturan</p>
                </Button>}
                {labelModal && <LabelForm labelData={labels} projectId={projectId} onCancel={() => setLabelModal(false)}/>}
            </div>
        </div>
    )
}
