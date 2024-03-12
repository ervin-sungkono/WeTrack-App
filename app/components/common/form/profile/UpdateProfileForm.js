/* eslint-disable react/no-children-prop */
import { IoIosInformationCircle, IoMdPin } from "react-icons/io";
import FormikWrapper from "../formik/FormikWrapper";
import FormikFieldIcon from "../formik/FormikFieldIcon";
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
                        <FormikFieldIcon
                            icon={<IoIosInformationCircle className="text-xl md:text-2xl" />}
                            name="description"
                            label={"Description"}
                            type="text"
                            disabled={false}
                            placeholder="Enter description..."
                        />
                        <FormikFieldIcon
                            icon={<MdEmail className="text-xl md:text-2xl" />}
                            name="email"
                            label={"Email"}
                            required
                            type="email"
                            disabled={true}
                            placeholder="Enter email..."
                        />
                        <FormikFieldIcon
                            icon={<TbBriefcaseFilled className="text-xl md:text-2xl"/>}
                            name="jobPosition"
                            label={"Job Position"}
                            type="text"
                            disabled={false}
                            placeholder="Enter job position..."
                        />
                        <FormikFieldIcon
                            icon={<IoMdPin className="text-lg md:text-xl"/>}
                            name="location"
                            label={"Location"}
                            type="text"
                            disabled={false}
                            placeholder="Enter location..."
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 mb-12">
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
