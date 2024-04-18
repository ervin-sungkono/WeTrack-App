"use client"
import Link from "next/link"
import { useSessionStorage } from "@uidotdev/usehooks"
import { IoIosArrowForward as ArrowIcon } from "react-icons/io"
import { useEffect, useState } from "react"

export default function Breadcrumb({ links }){
    const [project, _] = useSessionStorage("project")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      if(project) setMounted(true)
    }, [project])

    if(!mounted) return null
    return (
      <p className="text-dark-blue/80 text-xs md:text-sm flex items-center gap-1.5">
        {links.map(({url, label}, index) =>
          index !== links.length - 1 ? (
            <span key={label} className="flex items-center gap-1.5">
              <Link href={url} className="hover:underline">
                {label}
              </Link>{' '}
              <ArrowIcon size={16}/>
            </span>
          ) : (
            <span className="cursor-default text-basic-blue font-medium" key={label}>
              {label === "Nama Proyek" ? project.projectName : label}
            </span>
          )
        )}
      </p>
    )
}
  