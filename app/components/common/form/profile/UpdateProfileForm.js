/* eslint-disable react/no-children-prop */
import { IoIosInformationCircle, IoMdPin } from "react-icons/io";
import FormikWrapper from "../formik/FormikWrapper";
import FormikField from "../formik/FormikField";
import { MdEmail } from "react-icons/md";
import { TbBriefcaseFilled } from "react-icons/tb";
import Button from "../../button/Button";
import { updateProfileSchema } from "@/app/lib/schema";
import { useSession } from "next-auth/react";

export default function UpdateProfileForm({initialValues, setUpdateProfile, handleUpdateProfile}) {
    const { data: session } = useSession()

    return (
        <FormikWrapper
            initialValues={initialValues}
            onSubmit={handleUpdateProfile}
            validationSchema={updateProfileSchema}
            children={(formik) => (
                <div>
                    <div className="overflow-auto h-1/4 md:h-full flex flex-col gap-4">
                        <FormikField
                            icon={<IoIosInformationCircle className="text-lg md:text-xl"/>}
                            name="description"
                            label={"Description"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Enter description..."
                        />
                        <FormikField
                            icon={<MdEmail className="text-lg md:text-xl"/>}
                            name="email"
                            label={"Email"}
                            required
                            type="text"
                            value={session.user.email}
                            disabled={true}
                            placeholder="Enter email..."
                        />
                        <FormikField
                            icon={<TbBriefcaseFilled className="text-lg md:text-xl"/>}
                            name="jobPosition"
                            label={"Job Position"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Enter job position..."
                        />
                        <FormikField
                            icon={<IoMdPin className="text-lg md:text-xl"/>}
                            name="location"
                            label={"Location"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Enter location..."
                        />
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
