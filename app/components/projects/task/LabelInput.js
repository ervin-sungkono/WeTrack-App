import { useEffect, useRef, useState } from "react";
import Tags from "@/app/lib/tagify";
import LabelForm from "../../common/form/LabelForm";
import Button from "../../common/button/Button";

import { getQueryReference } from "@/app/firebase/util";
import { onSnapshot } from "firebase/firestore";
import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

export default function LabelInput({ projectId, onChange }){
    const [labelModal, setLabelModal] = useState(false)
    const [labels, setLabels] = useState()

    useEffect(() => {
        if(!projectId) return

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

    const tagifyRef = useRef()
    const tagifySettings = {
        skipInvalid: true,
        maxTags: 6,
        placeholder: "Masukkan label..",
        dropdown: {
            maxItems: 20,           // <- mixumum allowed rendered suggestions
            classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
            enabled: 0,             // <- show suggestions on focus
            closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
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

    if(!labels) return null
    return(
        <div className="w-full flex flex-col gap-2">
            <label htmlFor="label" className="block font-semibold text-xs md:text-sm text-dark-blue">
                Label
            </label>
            <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4">
                <Tags
                    name="label"
                    whitelist={labels.map(label => ({
                        value: label.content,
                        tagColor: label.backgroundColor,
                        style: `background-color: ${label.backgroundColor}; color: ${pickTextColorBasedOnBgColor(label.backgroundColor)};`
                    }))}
                    // [  
                    //     { value:'apple', tagColor: 'red', style: 'background-color: red;' },
                    //     { value:'apple2', tagColor: 'blue', style: 'background-color: blue;' },
                    //     { value:'apple3', tagColor: 'yellow', style: 'background-color: yellow;' }
                    // ]
                    tagifyRef={tagifyRef}
                    settings={tagifySettings}
                    defaultValue={""}
                    onChange={onChange}
                />
                <Button variant="primary" size="sm" outline onClick={() => setLabelModal(true)}>
                    Kelola Label
                </Button>
                {labelModal && <LabelForm labelData={labels} projectId={projectId} onCancel={() => setLabelModal(false)}/>}
            </div>   
        </div>
    )
}