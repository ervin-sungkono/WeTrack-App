"use client"
import PopUpForm from "../alert/PopUpForm";
import FormikWrapper from "./formik/FormikWrapper";
import FormikField from "./formik/FormikField";
import FormikSelectField from "./formik/FormikSelectField";
import Button from "../button/Button";
import FormikTextarea from "./formik/FormikTextarea";
import UserSelectButton from "../UserSelectButton";
import LabelInput from "../../projects/task/LabelInput";

import { FiPlus as PlusIcon } from "react-icons/fi";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { createNewTask } from "@/app/lib/fetch/task";
import { priorityList } from "@/app/lib/string";
import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

export default function CreateTaskForm({ onCancel }){
    const [assignee, setAssignee] = useState()
    const [labels, setLabels] = useState([])
    const projectId = "35d1MkXCZY4SBrKRVvqs"

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
        <PopUpForm
            title={"Buat Tugas"}
            message={"Buat tugas baru"}
            titleSize={"large"}
        >
            <FormikWrapper
                initialValues={initialValues}
                validationSchema={null}
                onSubmit={handleSubmit}
                className={"flex flex-col gap-4 md:gap-6 h-full overflow-y-auto"}
            >
                {(formik) => (
                    <>
                        <div className="custom-scrollbar w-full pb-2 md:pb-4 h-full pr-2 flex flex-col gap-2.5 md:gap-4 overflow-y-auto">
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
                                options={priorityList}
                                defaultValue={priorityList[0]}
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
                            <LabelInput projectId={projectId} onChange={handleTagifyChange}/>
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
                    </>
                )}
            </FormikWrapper>
        </PopUpForm> 
    )
}