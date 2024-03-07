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
                <div>
                    <div className="overflow-auto h-1/4 md:h-full">
                        <div>
                            <div className="flex items-center">
                                <IoIosInformationCircle size={24} />
                            </div>
                            <FormikField
                                name="description"
                                label={"Description"}
                                required
                                type="text"
                                placeholder="Enter description..."
                            />
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center">
                                <MdEmail size={24} />
                                <p className="text-sm md:text-base font-bold ml-2">
                                    Email
                                </p>
                            </div>
                            <p className="text-xs md:text-sm ml-8">
                                <FormikField
                                    name="email"
                                    required
                                    type="email"
                                    placeholder="Enter description..."
                                />
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center">
                                <TbBriefcaseFilled size={24} />
                                <p className="text-sm md:text-base font-bold ml-2">
                                    Job Position
                                </p>
                            </div>
                            <p className="text-xs md:text-sm ml-8">
                                <FormikField
                                    name="jobPosition"
                                    required
                                    type="text"
                                    placeholder="Enter job position..."
                                />
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center">
                                <IoMdPin size={24} />
                                <p className="text-sm md:text-base font-bold ml-2">
                                    Location
                                </p>
                            </div>
                            <p className="text-xs md:text-sm ml-8">
                                <FormikField
                                    name="location"
                                    required
                                    type="text"
                                    placeholder="Enter location..."
                                />
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-4">
                        <Button variant="primary" type="submit">
                            Confirm Update Profile
                        </Button>
                        <Button variant="secondary" onClick={() => setUpdateProfile(false)}>
                            Cancel Update Profile
                        </Button>
                    </div>
                </div>
            )}
        />
    );
}
