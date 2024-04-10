"use client"
import PopUpForm from "../alert/PopUpForm";
import FormikWrapper from "./formik/FormikWrapper";
import FormikField from "./formik/FormikField";
import FormikSelectField from "./formik/FormikSelectField";
import Button from "../button/Button";
import FormikTextarea from "./formik/FormikTextarea";
import UserSelectButton from "../UserSelectButton";
import Tags from "@/app/lib/tagify";
import LabelForm from "./LabelForm";
import { FiPlus as PlusIcon } from "react-icons/fi";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { pickTextColorBasedOnBgColor } from "@/app/lib/color";
import { createNewTask } from "@/app/lib/fetch/task";

export default function CreateTaskForm({ onCancel }){
    const [assignee, setAssignee] = useState()
    const [labels, setLabels] = useState([])
    const [labelModal, setLabelModal] = useState(false)

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
            `
        }
    }

    useEffect(() => {
        document.querySelector('.tagify__input').contentEditable = false
    }, [])

    const initialValues = {
        projectId: "",
        startDate: "",
        dueDate: "",
        statusId: "",
        taskName: "",
        parentId: ""
    }
    const { data: session } = useSession()

    const userList = [
        {
            user: {
                id: "WeEzNxSREEdyDpSXkIYCAyA4E8y1",
                fullName: "Ervin Cahyadinata Sungkono",
                profileImage: null
            }
        },
        {
            user: {
                id: "02",
                fullName: "Kenneth Nathanael",
                profileImage: null
            }
        },
        {
            user: {
                id: "03",
                fullName: "Christopher Vinantius",
                profileImage: null
            }
        }
    ]

    const priorityOptions = [
        { label: "Tidak ada", value: 0 },
        { label: "Rendah", value: 1 },
        { label: "Sedang", value: 2 },
        { label: "Tinggi", value: 3 }
    ]

    const handleTagifyChange = (e) => {
        setLabels(e.detail.value)
    }

    const handleSubmit = (values) => {
        console.log(values)

        createNewTask({
            ...values,
            assignedTo: assignee,
            labels,
        })
    }

    return(
        <>
            <PopUpForm
                title={"Buat Tugas"}
                message={"Buat tugas baru"}
                titleSize={"large"}
            >
                <FormikWrapper
                    initialValues={initialValues}
                    validationSchema={null}
                    onSubmit={handleSubmit}
                >
                    {(formik) => (
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="custom-scrollbar w-full pb-4 max-h-[65vh] pr-2 flex flex-col gap-2.5 md:gap-4 overflow-y-auto">
                                <FormikSelectField 
                                    label="Proyek" 
                                    required 
                                    name="projectId" 
                                    placeholder={"-- Pilih Proyek --"}
                                    options={[]}
                                />
                                <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                    <FormikField 
                                        label="Tanggal Mulai" 
                                        name="startDate" 
                                        type="date" 
                                    />
                                    <FormikField 
                                        label="Tanggal Selesai" 
                                        name="dueDate" 
                                        type="date" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <FormikSelectField 
                                        label="Status" 
                                        required 
                                        name="statusId"  
                                        placeholder={"-- Pilih Status --"}
                                        options={[]}
                                    />
                                    <p className="text-xs text-dark-blue">Ini adalah status awal tugas setelah dibuat.</p>
                                </div>
                                <FormikSelectField 
                                    label="Prioritas" 
                                    required 
                                    name="priority" 
                                    placeholder={"-- Pilih Prioritas --"}
                                    options={priorityOptions}
                                    defaultValue={priorityOptions[0]}
                                />
                                <FormikField 
                                    label="Judul" 
                                    required
                                    name="taskName" 
                                    type="text" 
                                    placeholder={"Masukkan judul tugas.."}
                                />
                                <FormikTextarea
                                    label="Deskripsi"
                                    required
                                    name={"description"}
                                    placeholder={"Masukkan deskripsi tugas.."}
                                    rows={5}
                                />
                                <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                    <div className="w-full flex flex-col gap-2">
                                        <label htmlFor="assignedTo" className="block font-semibold text-xs md:text-sm text-dark-blue">
                                            Penerima
                                        </label>
                                        <UserSelectButton
                                            name="assignedTo"
                                            userId={session.user.uid}
                                            options={userList}
                                            onChange={(value) => setAssignee(value)}
                                        />
                                    </div>
                                    <div className="w-full flex flex-col gap-2">
                                        <label htmlFor="assignedTo" className="block font-semibold text-xs md:text-sm text-dark-blue">
                                            Pelapor
                                        </label>
                                        <UserSelectButton
                                            name="createdBy"
                                            placeholder={session.user}
                                            disabled
                                        />
                                    </div>
                                </div>
                            <div className="w-full flex flex-col gap-2">
                                <label htmlFor="label" className="block font-semibold text-xs md:text-sm text-dark-blue">
                                    Label
                                </label>
                                <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4">
                                    <Tags
                                        name="label"
                                        whitelist={[  
                                            { value:'apple', tagColor: 'red', style: 'background-color: red;' },
                                            { value:'apple2', tagColor: 'blue', style: 'background-color: blue;' },
                                            { value:'apple3', tagColor: 'yellow', style: 'background-color: yellow;' }
                                        ]}
                                        tagifyRef={tagifyRef}
                                        settings={tagifySettings}
                                        defaultValue={""}
                                        onChange={handleTagifyChange}
                                    />
                                    <Button variant="primary" size="sm" outline onClick={() => setLabelModal(true)}>
                                        Kelola Label
                                    </Button>
                                </div>   
                            </div>
                                <FormikSelectField 
                                    label="Induk Tugas" 
                                    required 
                                    name="parentId" 
                                    placeholder={"-- Pilih Induk Tugas --"}
                                    options={[]}
                                />
                            </div>
                            <div className="flex justify-end gap-2 md:gap-4">
                                <Button variant="secondary" onClick={onCancel}>Batal</Button>
                                <Button type={"submit"} className="w-24 md:w-32">Buat</Button>
                            </div>
                        </div>
                    )}
                </FormikWrapper>
            </PopUpForm>
            {labelModal && <LabelForm labels={labels} onCancel={() => setLabelModal(false)}/>}
        </>
        
    )
}