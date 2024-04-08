/* eslint-disable react/no-children-prop */
"use client"
import { updateProjectSchema } from "@/app/lib/schema";
import FormikWrapper from "../formik/FormikWrapper";
import FormikField from "../formik/FormikField";
import { useState } from "react";
import FormikSelectField from "../formik/FormikSelectField";
import Button from "../../button/Button";
import PopUpLoad from "../../alert/PopUpLoad";
import useSessionStorage from "@/app/lib/hooks/useSessionStorage";

export default function SettingForm(){
    
    const [project, _] = useSessionStorage("project")

    console.log(project)

    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const initialValues = {
        projectName: project?.projectName ?? "",
        key: "",
        startStatus: "",
        endStatus: "",
    }

    const statusOptions = [
        { value: "To Do", label: "To Do" },
        { value: "In Progress", label: "In Progress" },
        { value: "Done", label: "Done" },
    ]

    const handleUpdateStartStatus = (value) => {
        console.log(value)
    }

    const handleUpdateEndStatus = (value) => {
        console.log(value)
    }

    const handleSubmit = (values) => {
        setError(false)
        setLoading(true)
    }

    const handleDeleteProject = () => {
        setError(false)
        setLoading(true)
    }

    return (
        <div>
            <FormikWrapper
                initialValues={initialValues}
                handleSubmit={handleSubmit}
                validationSchema={updateProjectSchema}
                children={(formik) => (
                    <div className="w-full md:w-3/4">
                        <div className="mb-4">
                            <FormikField
                                name="projectName"
                                required
                                type="text"
                                label="Nama Proyek"
                                placeholder="Masukkan nama proyek..."
                            />
                        </div>
                        {error && <p className="text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
                        <div className="mb-4">
                            <FormikField
                                name="key"
                                required
                                type="text"
                                label="Kunci"
                                placeholder="Masukkan kunci..."
                            />
                        </div>
                        {error && <p className="text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
                        <div className="mb-4">
                            <FormikSelectField
                                name="startStatus"
                                label="Status Awal"
                                placeholder="Pilih status awal..."
                                options={statusOptions}
                                onChange={handleUpdateStartStatus}
                            />
                        </div>
                        <div className="mb-6">
                            <FormikSelectField
                                name="endStatus"
                                label="Status Akhir"
                                placeholder="Pilih status akhir..."
                                options={statusOptions}
                                onChange={handleUpdateEndStatus}
                            />
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <Button onClick={handleDeleteProject} variant="danger">Hapus Proyek</Button>
                            </div>
                            <div className="flex gap-2 md:gap-4">
                                <Button variant="secondary">Batal</Button>
                                <Button onClick={handleSubmit} variant="primary">Perbarui</Button>
                            </div>
                        </div>
                    </div>
                )}
            />
            {loading && (
                <PopUpLoad />
            )}
        </div>
    )
}