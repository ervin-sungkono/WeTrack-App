/* eslint-disable react/no-children-prop */
import { IoIosInformationCircle, IoMdPin } from "react-icons/io";
import FormikWrapper from "../formik/FormikWrapper";
import FormikField from "../formik/FormikField";
import { MdEmail } from "react-icons/md";
import { TbBriefcaseFilled } from "react-icons/tb";
import Button from "../../button/Button";
import { updateProfileSchema } from "@/app/lib/schema";

export default function UpdateProfileForm({initialValues, setUpdateProfile, handleUpdateProfile}) {

    return (
        <FormikWrapper
            initialValues={initialValues}
            onSubmit={handleUpdateProfile}
            validationSchema={updateProfileSchema}
            children={(formik) => (
                <div className="overflow-auto max-w-2xl mx-auto h-full">
                    <div className="overflow-auto flex flex-col gap-4 md:gap-6">
                        <div className="flex gap-2">
                            <IoIosInformationCircle className="text-xl md:text-2xl"/>
                            <FormikField
                                name="description"
                                label={"Description"}
                                required
                                type="text"
                                placeholder="Enter description..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <MdEmail className="text-xl md:text-2xl"/>
                            <FormikField
                                name="email"
                                label={"Email"}
                                required
                                type="email"
                                placeholder="Enter description..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <TbBriefcaseFilled className="text-xl md:text-2xl"/>
                            <FormikField
                                name="jobPosition"
                                label={"Job Position"}
                                required
                                type="text"
                                placeholder="Enter job position..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <IoMdPin className="text-xl md:text-2xl"/>
                            <FormikField
                                name="location"
                                label={"Location"}
                                required
                                type="text"
                                placeholder="Enter location..."
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-end md:flex-row gap-3 md:gap-4 mt-6">
                        <Button variant="primary" type="submit">
                            Update Profile
                        </Button>
                        <Button variant="secondary" onClick={() => setUpdateProfile(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        />
    );
}
