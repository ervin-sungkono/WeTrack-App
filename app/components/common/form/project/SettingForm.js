/* eslint-disable react/no-children-prop */
"use client"
import { updateProjectSchema } from "@/app/lib/schema";
import FormikWrapper from "../formik/FormikWrapper";
import FormikField from "../formik/FormikField";
import { useEffect, useState } from "react";
import FormikSelectField from "../formik/FormikSelectField";
import Button from "../../button/Button";
import PopUpLoad from "../../alert/PopUpLoad";
import { getDocumentReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import { updateProject, deleteProject } from "@/app/lib/fetch/project";
import PopUpInfo from "../../alert/PopUpInfo";
import DeleteProjectForm from "./DeleteProjectForm";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";

export default function SettingForm({projectId}){

    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [errorDelete, setErrorDelete] = useState(false)
    const [errorDeleteMessage, setErrorDeleteMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const role = useRole()
    const [projectName, setProjectName] = useState("")

    const [projectSettings, setProjectSettings] = useState({
        projectName: "",
        key: "",
        startStatus: "",
        endStatus: "",
        startStatusName: "",
        endStatusName: ""
    })
    
    const [taskStatusesOptions, setTaskStatusesOptions] = useState([])

    const [successUpdateProject, setSuccessUpdateProject] = useState(false)
    const [deleteProjectMode, setDeleteProjectMode] = useState(false)
    const [successDeleteProject, setSuccessDeleteProject] = useState(false)

    const handleUpdateStartStatus = (value) => {
        setProjectSettings(prevState => ({
            ...prevState,
            startStatus: value
        }))
    }

    const handleUpdateEndStatus = (value) => {
        setProjectSettings(prevState => ({
            ...prevState,
            endStatus: value
        }))
    }

    const handleUpdateProject = async (values) => {
        setError(false)
        setLoading(true)
        try{
            const res = await updateProject({
                projectId: projectId,
                projectName: values.projectName,
                key: values.key,
                startStatus: values.startStatus,
                endStatus: values.endStatus
            })
            if(res.error){
                setError(true)
                console.log(JSON.parse(res.error).errors)
            }else{
                setSuccessUpdateProject(true)
            }
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
    }

    const handleDeleteProject = async (values) => {
        setError(false)
        setErrorDelete(false)
        setLoading(true)
        if(values.projectName !== projectSettings.projectName){
            setErrorDelete(true)
            setErrorDeleteMessage("Nama proyek yang Anda masukkan tidak sesuai!")
            setLoading(false)
            return
        }
        try{
            const res = await deleteProject({
                id: projectId
            })
            if(res.error){
                setErrorDelete(true)
                console.log(JSON.parse(res.error).errors)
            }else{
                setDeleteProjectMode(false)
                setSuccessDeleteProject(true)
            }
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if(!projectId) return
        const reference = getDocumentReference({collectionName: "projects", id: projectId})
        const snapshot = getDoc(reference)
        snapshot.then(doc => {
            if(doc.exists()){
                const data = doc.data()
                setProjectSettings({
                    projectName: data.projectName,
                    key: data.key,
                    startStatus: data.startStatus,
                    endStatus: data.endStatus
                })
                setProjectName(data.projectName)
                setLoading(false)
            }else{
                setError(true)
                setLoading(false)
            }
        })
    }, [projectId])

    useEffect(() => {
        const reference = getQueryReferenceOrderBy({collectionName: "taskStatuses", field: "projectId", id: projectId, orderByKey: "order"})
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const taskStatusesData = snapshot.docs.map(taskStatusDoc => ({
                id: taskStatusDoc.id,
                status: taskStatusDoc.data().statusName
            }))
            setTaskStatusesOptions(taskStatusesData.map(taskStatus => ({
                label: taskStatus.status,
                value: taskStatus.id
            })))
            setProjectSettings(prevState => ({
                ...prevState,
                startStatusName: taskStatusesData.find(taskStatus => taskStatus.id === prevState.startStatus)?.status || "",
                endStatusName: taskStatusesData.find(taskStatus => taskStatus.id === prevState.endStatus)?.status || ""
            }))
        })
        return () => unsubscribe()
    }, [projectId])

    if(loading){
        return <PopUpLoad />
    }else{
        return (
            <div>
                <FormikWrapper
                    initialValues={projectSettings}
                    onSubmit={handleUpdateProject}
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
                                    disabled={validateUserRole({ userRole: role, minimumRole: 'Owner' }) ? false : true}
                                />
                                {error && <p className="text-xs md:text-sm text-danger-red font-medium">{errorMessage}</p>}
                            </div>
                            <div className="mb-4">
                                <FormikField
                                    name="key"
                                    required
                                    type="text"
                                    label="Kunci Proyek"
                                    placeholder="Masukkan kunci proyek..."
                                    disabled={validateUserRole({ userRole: role, minimumRole: 'Owner' }) ? false : true}
                                />
                                {error && <p className="text-xs md:text-sm text-danger-red font-medium">{errorMessage}</p>}
                            </div>
                            {validateUserRole({ userRole: role, minimumRole: 'Owner' }) ? (
                                <>
                                    <div className="mb-4">
                                        <FormikSelectField
                                            name="startStatus"
                                            label="Status Awal"
                                            placeholder="Pilih status awal..."
                                            options={taskStatusesOptions}
                                            onChange={handleUpdateStartStatus}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <FormikSelectField
                                            name="endStatus"
                                            label="Status Akhir"
                                            placeholder="Pilih status akhir..."
                                            options={taskStatusesOptions}
                                            onChange={handleUpdateEndStatus}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <FormikField
                                            name="startStatusName"
                                            type="text"
                                            label="Status Awal"
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <FormikField
                                            name="endStatusName"
                                            type="text"
                                            label="Status Akhir"
                                            disabled
                                        />
                                    </div>
                                </>
                            )}
                            {validateUserRole({ userRole: role, minimumRole: 'Owner' }) && (
                                <div className="flex justify-between">
                                    <div>
                                        <Button onClick={() => {
                                            setErrorDelete(false)
                                            setDeleteProjectMode(true)
                                        }} variant="danger">Hapus Proyek</Button>
                                    </div>
                                    <div className="flex gap-2 md:gap-4">
                                        {formik.dirty && (
                                            <Button onClick={() => formik.resetForm()} variant="secondary">Batalkan</Button>
                                        )}
                                        <Button type="submit" variant="primary">Perbarui</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                />
                {deleteProjectMode && (
                    <DeleteProjectForm 
                        onConfirm={handleDeleteProject}
                        onClose={() => setDeleteProjectMode(false)}
                        error={errorDelete}
                        errorMessage={errorDeleteMessage}
                        projectName={projectName}
                    />
                )}
                {successUpdateProject &&
                    <PopUpInfo
                        title={"Proyek Diperbarui"}
                        titleSize={"default"}
                        message={"Data proyek telah berhasil diperbarui."}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setSuccessUpdateProject(false)
                                location.reload()
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                }
                {successDeleteProject &&
                    <PopUpInfo
                        title={"Proyek Dihapus"}
                        titleSize={"default"}
                        message={"Proyek telah dihapus. Anda akan dialihkan ke halaman daftar proyek."}
                    >
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button onClick={() => {
                                setSuccessDeleteProject(false)
                                router.push("/projects")
                            }} className="w-24 md:w-32">OK</Button>
                        </div>
                    </PopUpInfo>
                }
            </div>
        )
    }
}