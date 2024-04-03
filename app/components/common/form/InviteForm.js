"use client"
import { useRef, useState } from "react"
import FormikWrapper from "./formik/FormikWrapper"
import Button from "../button/Button"
import Tags from "@/app/lib/tagify"
import { useSession } from "next-auth/react"
import PopUpForm from "../alert/PopUpForm"

export default function InviteForm({ onConfirm, onClose }){
    const { data: session } = useSession()

    const tagifyRef = useRef()
    const tagifySettings = {
        editTags: {
            keepInvalid: false,
        },
        blacklist: [session.user.email],
        backspace: 'edit',
        delimiters: " ",
        keepInvalidTags: true,
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        placeholder: "Ketik email anggota tim Anda, dipisahkan dengan spasi atau enter.."
    }

    const handleTagifyChange = (e) => {
        setTeams(e.detail.value)
    }

    return(
        <PopUpForm
            variant="secondary"
            title={"Tambah Anggota"}
            titleSize={"large"}
        >
            <FormikWrapper
                initialValues={{}}
                onSubmit={onConfirm}
            >
                {(formik) => {
                    return(
                        <div className="w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor={"teams"} className="block font-semibold text-xs md:text-sm">
                                        Undang Anggota Tim
                                    </label>
                                    <Tags
                                        name="teams"
                                        tagifyRef={tagifyRef}
                                        settings={tagifySettings}
                                        autoFocus
                                        onChange={handleTagifyChange}
                                    />
                                    <p className="text-[10.8px] md:text-xs text-dark-blue/80">Pengguna harus memiliki akun WeTrack untuk diundang ke dalam tim.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 md:gap-4">
                                <Button variant="secondary" onClick={onClose} className="w-24 md:w-32">Batal</Button>
                                <Button type={"submit"} className="w-24 md:w-32">Kirim</Button>
                            </div>
                        </div>
                    ) 
                }}
            </FormikWrapper>
        </PopUpForm>
    )
}