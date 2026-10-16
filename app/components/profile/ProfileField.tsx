import type { ReactNode } from "react"

type ProfileFieldProps = {
  icon: ReactNode
  label: string
  value: ReactNode
  nullValue?: boolean
}

export default function ProfileField({ icon, label, value, nullValue = false }: ProfileFieldProps) {
  return (
    <div className="flex gap-2">
      <div>{icon}</div>
      <div className="flex flex-col gap-1 w-full">
        <p className="block font-semibold text-sm md:text-base">{label}</p>
        <div className="relative flex items-center">
          <div className={`w-full rounded-md bg-transparent text-xs md:text-sm ${nullValue ? "italic" : ""}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
