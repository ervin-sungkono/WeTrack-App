export type SelectOption<Value extends string | number | null = string> = {
  label: string
  value: Value
}

export type CreateTaskFormValues = {
  projectId: string
  type: "Task" | "SubTask"
  startDate: string | null
  dueDate: string | null
  priority: number
  statusId: string
  taskName: string
  description: string | null
  assignedTo: string | null
  parentId: string | null
}

export type BreadcrumbLink = {
  url: string
  label: string
}

export type SidebarNavigationLink = {
  label: string
  url: string
  icon: ReactNode
}

export type MenuAction<Event = MouseEvent<HTMLButtonElement>> = {
  label: string
  fnCall: (event: Event) => void
  disableFn?: boolean
}
import type { MouseEvent, ReactNode } from "react"
