"use client"
import { useEffect, useRef, useState } from "react";
import Tags from "@/app/lib/tagify";
import LabelForm from "../../common/form/create-task/LabelForm";
import Button from "../../common/button/Button";

import { getQueryReference, getProjectRole } from "@/app/firebase/util";
import { getSession } from "next-auth/react";
import { onSnapshot } from "firebase/firestore";
import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

// import { IoMdSettings as SettingsIcon } from "react-icons/io";
import { validateUserRole } from "@/app/lib/helper";

export default function LabelInput({ hideLabel = false, projectId, labelData, onChange, resetLabel = null }){
    const [labelModal, setLabelModal] = useState(false)
    const [labels, setLabels] = useState([])
    const [role, setRole] = useState()

    useEffect(() => {
        if(!projectId) return

        resetLabel && resetLabel()

        const reference = getQueryReference({ collectionName: "labels", field: "projectId", id: projectId })
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const updatedLabels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setLabels(updatedLabels)
        })

        return () => unsubscribe()
    }, [projectId])

    useEffect(() => {
        try{
            if(projectId){
                getSession()
                .then(session => {
                    if(session){
                        getProjectRole({ projectId, userId: session.user.uid})
                        .then(role => setRole(role))
                    }
                })
            }
        }
        catch(e){
            console.log(e)
            setRole(null)
        }
    }, [projectId])

    const tagifyRef = useRef()
    const tagifySettings = {
        duplicates: true,
        skipInvalid: true,
        userInput: false,
        maxTags: 10,
        placeholder: "Masukkan label...",
        dropdown: {
            maxItems: 20,           // <- maximum allowed rendered suggestions
            classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
            enabled: 0,             // <- show suggestions on focus
            closeOnSelect: false,   // <- do not hide the suggestions dropdown once an item has been selected
        },
        transformTag: (tagData) => {
            tagData.style = `
                --tag-bg: ${tagData.tagColor};
                --tag-text-color: ${pickTextColorBasedOnBgColor(tagData.tagColor)};
                --tag-hover: ${tagData.tagColor};
                --tag-remove-btn-color: ${pickTextColorBasedOnBgColor(tagData.tagColor)};
                --tag-remove-bg: ${tagData.tagColor};
                --tag-remove-btn-bg--hover: ${pickTextColorBasedOnBgColor(tagData.tagColor)};
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
            <div className="w-full flex flex-col xs:flex-row gap-2">
                <Tags
                    name="label"
                    whitelist={labels.map(label => ({
                        id: label.id,
                        value: label.content,
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
                <Button variant="primary" size="sm" onClick={() => setLabelModal(true)}>
                    <p>Pengaturan</p>
                </Button>}
                {labelModal && <LabelForm labelData={labels} projectId={projectId} onCancel={() => setLabelModal(false)}/>}
            </div>   
        </div>
    )
}