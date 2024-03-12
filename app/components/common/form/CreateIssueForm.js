"use client"
import PopUpForm from "../alert/PopUpForm";
import FormikWrapper from "./formik/FormikWrapper";
import FormikField from "./formik/FormikField";
import FormikSelectField from "./formik/FormikSelectField";
import Button from "../button/Button";
import FormikTextarea from "./formik/FormikTextarea";
import UserSelectButton from "../UserSelectButton";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreateIssueForm({ onCancel }){
    const [assignee, setAssignee] = useState()
    const initialValues = {
        projectName: "",
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

    const handleSubmit = (values) => {
        console.log(values)
    }

    return(
        <PopUpForm
            title={"Create Issue"}
            message={"Add a new issue"}
            titleSize={"large"}
        >
            <FormikWrapper
                initialValues={initialValues}
                validationSchema={null}
                onSubmit={handleSubmit}
            >
                {(formik) => (
                    <div className="flex flex-col gap-4 md:gap-6">
                        <div className="w-full pb-4 max-h-[65vh] pr-2 flex flex-col gap-2.5 md:gap-4 overflow-y-auto">
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <FormikSelectField 
                                    label="Project" 
                                    required 
                                    name="projectId" 
                                    placeholder={"-- Select Project --"}
                                    options={[]}
                                />
                                <FormikSelectField 
                                    label="Issue Type" 
                                    required 
                                    name="typeId" 
                                    placeholder={"-- Select Issue Type --"}
                                    options={[]}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <FormikField 
                                    label="Start Date" 
                                    name="startDate" 
                                    type="date" 
                                />
                                <FormikField 
                                    label="Due Date" 
                                    name="dueDate" 
                                    type="date" 
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <FormikSelectField 
                                    label="Status" 
                                    required 
                                    name="statusId"  
                                    placeholder={"-- Select Status --"}
                                    options={[]}
                                />
                                <p className="text-xs text-dark-blue">This is the issue&#x2019;s initial status after creation.</p>
                            </div>
                            <FormikField 
                                label="Title" 
                                required
                                name="issueName" 
                                type="text" 
                                placeholder={"Enter issue title.."}
                            />
                            <FormikTextarea
                                label="Description"
                                required
                                name={"description"}
                                placeholder={"Enter issue description.."}
                                rows={5}
                            />
                            <div className="flex flex-col md:flex-row gap-2.5 md:gap-4">
                                <div className="w-full flex flex-col gap-2">
                                    <label htmlFor="assignedTo" className="block font-semibold text-xs md:text-sm text-dark-blue">
                                        Assignee
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
                                        Reporter
                                    </label>
                                    <UserSelectButton
                                        name="createdBy"
                                        placeholder={session.user}
                                        disabled
                                    />
                                    {/* Ini Nanti Read Only dengan value sesuai user yang mengisi form */}
                                </div>
                            </div>
                            {/* <FormikSelectField 
                                label="Labels" 
                                required 
                                name="label" 
                                placeholder={"-- Select Label --"}
                                options={[]}
                            /> */}
                            {/* Nanti pakai Tagify */}
                            <FormikSelectField 
                                label="Parent" 
                                required 
                                name="parentId" 
                                placeholder={"-- Select Parent --"}
                                options={[]}
                            />
                        </div>
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                            <Button type={"submit"} className="w-24 md:w-32">Create</Button>
                        </div>
                    </div>
                )}
            </FormikWrapper>
        </PopUpForm>
    )
}