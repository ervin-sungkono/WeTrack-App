import PopUpForm from "../alert/PopUpForm"
import FormikWrapper from "./formik/FormikWrapper"
import FormikSelectField from "./formik/FormikSelectField"
import Button from "../button/Button"
import { deleteStatusSchema } from "@/app/lib/schema"

import { IoArrowForward as ArrowIcon } from "react-icons/io5"

export default function DeleteStatusForm({ id, status, statusOptions, onClose, onSubmit }){
    const initialValues = {
        newStatusId: ""
    }

    return(
        <PopUpForm 
            title={`Pindah tugas dari kolom [${status.toUpperCase()}]`}
            wrapContent
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={deleteStatusSchema}
            >
                {(formik) => (
                    <>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <div className="w-full flex-grow flex flex-col gap-2">
                                <p className="text-xs md:text-sm font-semibold text-dark-blue">Status ini akan dihapus</p>
                                <div className="uppercase line-through text-xs md:text-sm font-medium py-1.5 md:py-2.5">[{status}]</div>
                            </div>
                            <div>
                                <ArrowIcon size={20} className="rotate-90 sm:rotate-0"/>
                            </div>
                            <div className="w-full flex-grow">
                                <FormikSelectField 
                                    label="Pindah tugas yang ada ke" 
                                    name="newStatusId" 
                                    placeholder={"-- Pilih Status --"}
                                    options={statusOptions}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-4 items-center justify-end mt-4 md:mt-8">
                            <Button variant="danger" type="submit">Hapus</Button>
                            <Button variant="secondary" onClick={onClose}>Batal</Button>
                        </div>
                    </>
                )}
            </FormikWrapper>
        </PopUpForm>
    )
}