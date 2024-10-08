"use client"
import PopUpForm from "../../alert/PopUpForm";
import FormikWrapper from "../formik/FormikWrapper";
import FormikField from "../formik/FormikField";
import FormikSelectField from "../formik/FormikSelectField";
import Button from "../../button/Button";
import FormikTextarea from "../formik/FormikTextarea";
import UserSelectButton from "../../UserSelectButton";
import LabelInput from "../../../projects/task/LabelInput";
import PopUpLoad from "../../alert/PopUpLoad";
import SelectStatusOption from "./SelectStatusOption";
import SelectProjectOption from "./SelectProjectOption";
import SelectAssigneeOption from "./SelectAssigneeOption";
import SelectParentOption from "./SelectParentOption";
import PopUpInfo from "../../alert/PopUpInfo";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { createNewTask } from "@/app/lib/fetch/task";
import { priorityList } from "@/app/lib/string";
import { newTaskSchema } from "@/app/lib/schema";

export default function CreateTaskForm({ onCancel }){
    const [labels, setLabels] = useState([])
    const [createSuccess, setCreateSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const initialValues = {
        projectId: '',
        type: 'Task',
        startDate: null,
        dueDate: null,
        priority: 0,
        statusId: '',
        taskName: '',
        description: null,
        assignedTo: null,
        parentId: null
    }
    const { data: session } = useSession()

    const handleTagifyChange = (e) => {
        setLabels(e.detail.value)
    }

    const handleSubmit = async(values, { setSubmitting, resetForm }) => {
        setLoading(true)
        try{
            const res = await createNewTask({
                ...values,
                taskName: values.taskName.trim(),
                description: values.description?.trim(),
                labels,
            })

            if(res.data){
                setCreateSuccess(true)
            }
        }catch(e){
            console.log(e)
        }finally{
            resetForm({
                values: {
                    projectId: values.projectId,
                    startDate: null,
                    dueDate: null,
                    type: 'Task',
                    priority: 0,
                    statusId: values.statusId,
                    taskName: '',
                    description: null,
                    assignedTo: values.assignedTo,
                    parentId: null
                }
            })
            setLabels([])
            setLoading(false)
            setSubmitting(false)
        }
    }

    if(!session) return <PopUpLoad/>
    return(
        <PopUpForm
            title={"Buat Tugas"}
            titleSize={"large"}
        >
            <FormikWrapper
                initialValues={initialValues}
                validationSchema={newTaskSchema}
                onSubmit={handleSubmit}
                className={"flex flex-col gap-4 md:gap-6 h-full overflow-y-auto"}
            >
                {(formik) => (
                    <>
                        {loading && <PopUpLoad/>}
                        {createSuccess && 
                        <PopUpInfo
                            title={"Tugas Berhasil Dibuat"}
                            message={"Silakan cek tugas yang telah dibuat pada halaman tugas atau papan Kanban."}
                        >
                            <div className="flex justify-end gap-2 md:gap-4">
                                <Button onClick={() => setCreateSuccess(false)} className="w-24 md:w-32">OK</Button>
                            </div>
                        </PopUpInfo>}
                        <div className="custom-scrollbar w-full pb-2 md:pb-4 h-full pr-2 flex flex-col gap-2.5 md:gap-4 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <SelectProjectOption/>
                                <FormikSelectField 
                                    label="Tipe Tugas"
                                    name="type" 
                                    required
                                    options={[
                                        {label: "Tugas", value: "Task"},
                                        {label: "Subtugas", value: "SubTask"}
                                    ]}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <FormikField 
                                    label="Tanggal Mulai" 
                                    name="startDate" 
                                    type="date" 
                                />
                                <FormikField 
                                    label="Tenggat Waktu" 
                                    name="dueDate" 
                                    type="date" 
                                />
                            </div>
                            <SelectStatusOption/>
                            <FormikSelectField 
                                label="Prioritas"
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
                                placeholder={"Masukkan judul tugas..."}
                            />
                            <FormikTextarea
                                label="Deskripsi"
                                name="description"
                                placeholder={"Masukkan deskripsi tugas..."}
                                max={1000}
                                rows={5}
                            />
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <SelectAssigneeOption session={session}/>
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
                            <LabelInput projectId={formik.values.projectId} labelData={labels} onChange={handleTagifyChange} resetLabel={() => setLabels([])}/>
                            <SelectParentOption/>
                        </div>
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={onCancel}>Kembali</Button>
                            <Button type={"submit"} disabled={formik.isSubmitting} className="w-24 md:w-32">Buat</Button>
                        </div>
                    </>
                )}
            </FormikWrapper>
        </PopUpForm> 
    )
}