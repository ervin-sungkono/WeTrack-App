"use client"
import Link from "next/link"
import { useSessionStorage } from "usehooks-ts"
import { IoIosArrowForward as ArrowIcon } from "react-icons/io"
import type { BreadcrumbLink } from "@/app/types/ui"

type ProjectSession = { projectName?: string }
type BreadcrumbProps = { links: BreadcrumbLink[] }

export default function Breadcrumb({ links }: BreadcrumbProps){
    const [project] = useSessionStorage<ProjectSession | null>("project", null)

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
          ) :
            <span className="cursor-default text-basic-blue font-medium" key={label}>
              {label === "Nama Proyek" ? project?.projectName : label}
            </span>
        )}
      </p>
    )
}
