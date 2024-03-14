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
                <div className="overflow-auto h-full">
                    <div className="overflow-auto flex flex-col gap-4 md:gap-6">
                        <FormikFieldIcon
                            icon={<IoIosInformationCircle className="text-xl md:text-2xl" />}
                            name="description"
                            label={"Deskripsi"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Masukkan deskripsi..."
                        />
                        <FormikFieldIcon
                            icon={<MdEmail className="text-xl md:text-2xl" />}
                            name="email"
                            label={"Email"}
                            required
                            type="email"
                            disabled={true}
                            placeholder="Masukkan email..."
                        />
                        <FormikFieldIcon
                            icon={<TbBriefcaseFilled className="text-xl md:text-2xl"/>}
                            name="jobPosition"
                            label={"Posisi Pekerjaan"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Masukkan posisi pekerjaan..."
                        />
                        <FormikFieldIcon
                            icon={<IoMdPin className="text-lg md:text-xl"/>}
                            name="location"
                            label={"Lokasi"}
                            required
                            type="text"
                            disabled={false}
                            placeholder="Masukkan lokasi..."
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6 mb-12">
                        <Button variant="primary" type="submit">
                            Konfirmasi Perbarui Profil
                        </Button>
                        <Button variant="secondary" onClick={() => setUpdateProfile(false)}>
                            Batal Perbarui Profil
                        </Button>
                    </div>
                </div>
            )}
        />
    );
}
