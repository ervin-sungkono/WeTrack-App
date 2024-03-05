/* eslint-disable react/no-children-prop */
import { changePasswordSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import FormikWrapper from "../formik/FormikWrapper"
import FormikField from "../formik/FormikField"
import Button from "../../button/Button"

export default function ChangePasswordForm({onConfirm, onClose}){
    const initialValues = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    }

    return (
        <PopUpForm
            variant="secondary"
            title={"Change Password"}
            message={"Make sure to confirm your new password before submitting."}
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onConfirm}
                validationSchema={changePasswordSchema}
                children={(formik) => (
                    <>
                        <div className="flex flex-col gap-4">
                            <div>
                                <FormikField
                                    name="oldPassword"
                                    required
                                    type="password"
                                    label="Old Password"
                                    placeholder="Enter old password..."
                                />
                            </div>
                            <div>
                                <FormikField
                                    name="newPassword"
                                    required
                                    type="password"
                                    label="New Password"
                                    placeholder="Enter new password..."
                                />
                            </div>
                            <div>
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Confirm New Password"
                                    placeholder="Enter new password confirmation..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-4 items-center justify-end mt-4 md:mt-8">
                            <Button size="sm" variant="pop-up-primary" type="submit">OK</Button>
                            <Button size="sm" variant="pop-up-secondary" onClick={onClose}>Cancel</Button>
                        </div>
                    </>
                )}
            />
        </PopUpForm>
    )
}