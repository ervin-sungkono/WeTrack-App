"use client"
import { useRef } from "react"
import FormikWrapper from "./formik/FormikWrapper"
import Button from "../button/Button"
import Tags from "@/app/lib/tagify"
import { useSession } from "next-auth/react"
import PopUpForm from "../alert/PopUpForm"

export default function InviteForm({ onConfirm, onClose, team, setTeams, setRole, error, errorMessage }){
    const { data: session } = useSession()

    let blacklistedEmails = [session.user.email]

    team.forEach(member => {
        if(member.email !== undefined){
            blacklistedEmails.push(member.email)
        }
    })

    const tagifyRef = useRef()
    const tagifySettings = {
        editTags: {
            keepInvalid: false,
        },
        blacklist: blacklistedEmails,
        backspace: 'edit',
        delimiters: " ",
        keepInvalidTags: true,
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        placeholder: "Ketik email anggota tim Anda, dipisahkan dengan spasi atau enter..."
    }

    const handleTagifyChange = (e) => {
        setTeams(e.detail.value)
    }

    const handleRoleChange = (e) => {
        setRole(e.target.value)
    }

    return(
        <PopUpForm
            variant="secondary"
            title={"Undang Anggota"}
            titleSize={"large"}
            wrapContent
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
                                    <p className="text-[10.8px] md:text-xs text-dark-blue/80">Undangan Anda hanya akan terkirim apabila email yang Anda masukkan terdaftar di WeTrack.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor={"role"} className="block font-semibold text-xs md:text-sm">
                                        Peran Anggota Tim
                                    </label>
                                    <div className="flex gap-4 items-center pl-1 text-xs md:text-sm">
                                        <div className="flex gap-1.5 items-center">
                                            <input name="role" value={"Member"} id="member" type="radio" onChange={handleRoleChange}/>
                                            <label htmlFor="Member" for="member">Member</label>
                                        </div>
                                        <div className="flex gap-1.5 items-center">
                                            <input name="role" value={"Viewer"} id="viewer" type="radio" onChange={handleRoleChange}/>
                                            <label htmlFor="Viewer" for="viewer">Viewer</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {error && <p className="mb-2 text-xs md:text-sm text-center text-danger-red font-medium">{errorMessage}</p>}
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