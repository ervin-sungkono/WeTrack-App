"use client"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { DragDropContext, Draggable, Droppable, type DraggableLocation, type DropResult, type DragStart, type DragUpdate } from "@hello-pangea/dnd"
import { createNewTask, reorderTask } from "@/app/lib/fetch/task"
import { createNewTaskStatus, deleteTaskStatus, reorderTaskStatus, updateTaskStatus } from "@/app/lib/fetch/taskStatus"
import { getDocumentReference, getQueryReferenceOrderBy, getTaskReferenceOrderBy } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import { validateUserRole } from "@/app/lib/helper"

import BoardList from "./BoardList"
import SearchBar from "../../common/SearchBar"
import SelectButton from "../../common/button/SelectButton"
import SimpleInputForm from "../../common/SimpleInputForm"
import Button from "../../common/button/Button"
import DotButton from "../../common/button/DotButton"
import UpdateStatusForm from "../../common/form/UpdateStatusForm"
import DeleteStatusForm from "../../common/form/DeleteStatusForm"
import PopUpLoad from "../../common/alert/PopUpLoad"
import { TailSpin } from "react-loader-spinner"
import { useSessionStorage } from "usehooks-ts"
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { getAllLabel } from "@/app/lib/fetch/label"

import { IoFilter as FilterIcon } from "react-icons/io5"
import { FiPlus as PlusIcon } from "react-icons/fi"
import { FaCheck as CheckIcon } from "react-icons/fa"
import { useRole } from "@/app/lib/context/role"
import { FaFilterCircleXmark as CloseFilterIcon } from "react-icons/fa6";
import type { Label, Project, Task, UserSummary } from "@/app/types/domain"
import type { BoardTask, PlaceholderProperties, SelectOption } from "../../types"
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders"

type BoardColumn = {
  id: string
  status: string
  order: number
  content: BoardTask[]
}

type ProjectSession = Pick<Project, "id" | "key" | "endStatus">
interface BoardContentProps {
  projectId: string
}

const reorder = <T,>(list: readonly T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const move = <T,>(source: readonly T[], destination: readonly T[], droppableSource: DraggableLocation, droppableDestination: DraggableLocation): Record<string, T[]> => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: Record<string, T[]> = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
}

const getDraggedDom = (draggableId: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[data-rfd-draggable-id='${CSS.escape(draggableId)}']`)

const getDestinationDom = (droppableId: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[data-rfd-droppable-id='${CSS.escape(droppableId)}']`)

export default function BoardContent({ projectId }: BoardContentProps){
  const [isCreatingTask, setCreatingTask] = useState(false)
  const [isCreatingList, setCreatingList] = useState(false)
  const [state, setState] = useState<BoardColumn[]>([]);
  const [query, setQuery] = useState("")
  const [filterDropdown, setFilterDropdown] = useState(false)
  const [activeStatusId, setActiveStatusId] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<BoardColumn | null>(null)
  const [updateConfirmation, setUpdateConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [taskStatusData, setTaskStatusData] = useState<Array<Omit<BoardColumn, "content">>>([])
  const [taskStatusProjectId, setTaskStatusProjectId] = useState<string | null>(null)
  const [taskDataProjectId, setTaskDataProjectId] = useState<string | null>(null)
  const [stateProjectId, setStateProjectId] = useState<string | null>(null)
  const [taskData, setTaskData] = useState<BoardTask[]>([])
  const [placeholderProps, setPlaceholderProps] = useState<PlaceholderProperties>({});
  const [project] = useSessionStorage<ProjectSession | null>("project", null)
  const [loading, setLoading] = useState(false)

  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([])
  const [labelOptions, setLabelOptions] = useState<SelectOption[]>([])
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [filterLabel, setFilterLabel] = useState<string | null>(null)

  const role = useRole()
  const { authReady } = useFirebaseAuthBridge()
  const boardState = authReady && taskStatusProjectId === projectId && taskDataProjectId === projectId && stateProjectId === projectId && taskStatusData.length > 0 ? state : []

  const showTaskCard = (statusId: string) => {
    setActiveStatusId(statusId)
  }

  const createTask = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeStatusId) return
    setCreatingTask(true)

    const formData = new FormData(e.currentTarget)
    const taskName = formData.get("taskName")
    if (typeof taskName !== "string" || !taskName.trim()) {
      setCreatingTask(false)
      return
    }

    await createNewTask({
      taskName: taskName.trim(),
      projectId: projectId,
      statusId: activeStatusId
    })

    setCreatingTask(false)
    setActiveStatusId(null)
  }

  const createTaskStatus = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const statusName = formData.get("taskStatusName")

    if (typeof statusName !== "string" || !statusName.trim()) return
    try {
      await createNewTaskStatus({
        projectId: projectId,
        statusName: statusName.trim(),
      })
      setCreatingList(false)
    } catch (error) {
      console.error("Failed to create task status", error)
    }
  }

  const showDeleteForm = (status: BoardColumn) => {
    setActiveStatus(status)
    setDeleteConfirmation(true)
  }

  const showUpdateForm = (status: BoardColumn) => {
    setActiveStatus(status)
    setUpdateConfirmation(true)
  }

  const hideDeleteForm = () => {
    setActiveStatus(null)
    setDeleteConfirmation(false)
  }

  const hideUpdateForm = () => {
    setActiveStatus(null)
    setUpdateConfirmation(false)
  }

  const handleUpdateStatus = async(values: { statusName: string }) => {
    setLoading(true)
    try{
      if (!activeStatus) return
      const res = await updateTaskStatus({ statusId: activeStatus.id, statusName: values.statusName })

      if(!res.success){
        alert("Gagal mengubah status tugas")
      }
    }catch(e){
      console.log(e)
    }finally{
      setLoading(false)
      setActiveStatus(null)
      setUpdateConfirmation(false)
    }
  }

  const handleDeleteStatus = async(values: { newStatusId: string }) => {
    setLoading(true)

    try{
      if (!activeStatus) return
      const res = await deleteTaskStatus({ statusId: activeStatus.id, projectId, newStatusId: values.newStatusId })

      if(!res.success){
        alert("Gagal menghapus status tugas")
      }
    }
    catch(e){
      console.log(e)
    }finally{
      setLoading(false)
      setActiveStatus(null)
      setDeleteConfirmation(false)
    }
  }

  useEffect(() => {
    if (taskStatusProjectId !== projectId || taskDataProjectId !== projectId || taskStatusData.length === 0) return
    const timeoutId = window.setTimeout(() => {
      setState(taskStatusData.map((status) => ({
        ...status,
        content: taskData.filter(task => task.status === status.id)
      })))
      setStateProjectId(projectId)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [projectId, taskData, taskDataProjectId, taskStatusData, taskStatusProjectId])

  useEffect(() => {
    if(!projectId || !authReady) return
    const statusReference = getQueryReferenceOrderBy({ collectionName: "taskStatuses", field: "projectId", id: projectId, orderByKey: "order" })
    let active = true
    const statusUnsubscribe = onSnapshot(statusReference, (snapshot) => {
      const taskStatusData = snapshot.docs.map(taskStatusDoc => ({
        id: taskStatusDoc.id,
        status: String(taskStatusDoc.data().statusName ?? ""),
        order: Number(taskStatusDoc.data().order ?? 0),
      }))
      if (active) {
        setTaskStatusData(taskStatusData)
        setTaskStatusProjectId(projectId)
      }
    }, (error) => console.error("Board status listener failed", error))

    const taskReference = getTaskReferenceOrderBy({ field: "projectId", id: projectId, orderByKey: "order" })
    const taskUnsubscribe = onSnapshot(taskReference, async (taskSnapshot) => {
      try {
      const taskData = await Promise.all(taskSnapshot.docs.map(async(taskDoc) => {
        const taskLabels = taskDoc.data().labels as string[] | undefined
        const labels = taskLabels && await Promise.all(taskLabels.map(async(label) => {
          const labelSnap = await getDoc(getDocumentReference({ collectionName: "labels", id: label }))
          return {
            id: labelSnap.id,
            ...labelSnap.data()
          } as Label
        }))
        const assignedToId = taskDoc.data().assignedTo as string | undefined
        const assignedToDoc = assignedToId ? await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId })) : null
        const assignedTo = assignedToDoc?.exists() ? {id: assignedToDoc.id, ...assignedToDoc.data()} as UserSummary : null
        const storedTask = { id: taskDoc.id, ...taskDoc.data() } as Task
        return {
          ...storedTask,
          assignedTo,
          labels: labels ?? [],
          status: storedTask.status ?? storedTask.statusId ?? "",
          priority: typeof storedTask.priority === "number" ? storedTask.priority : null,
        } satisfies BoardTask
      }))
      if (active) {
        setTaskData(taskData)
        setTaskDataProjectId(projectId)
      }
      } catch (error) {
        if (active) console.error("Failed to load board tasks", error)
      }
    }, (error) => console.error("Board task listener failed", error))

    return () => {
      active = false
      statusUnsubscribe()
      taskUnsubscribe()
    }
  }, [projectId, authReady])

  useEffect(() => {
    let active = true
    const fetchTeamOptions = async() => {
      if(!projectId || !authReady) return
      try {
      const teamData = await getAllTeamMember({ projectId, excludeViewer: true })
      if(active && teamData.data){
          setTeamOptions([
            ...teamData.data.map(team => ({
            value: team.userId,
            label: team.user?.fullName ?? team.email ?? ""
          }))
        ])
      }
      } catch (error) {
        if (active) console.error("Failed to load board assignees", error)
      }
    }
    const fetchLabelOptions = async() => {
      if(!projectId || !authReady) return
      try {
      const labelData = await getAllLabel({ projectId })
      if(active && labelData.data){
          setLabelOptions([
            ...labelData.data.map(label => ({
              value: label.id,
              label: label.content
            }))
          ])
      }
      } catch (error) {
        if (active) console.error("Failed to load board labels", error)
      }
    }
    fetchTeamOptions()
    fetchLabelOptions()
    return () => { active = false }
  }, [projectId, authReady])

  const handleSearch = (query: string) => {
    setQuery(query.toLowerCase())
  }

  const onDragEnd = useCallback(async(result: DropResult) => {
    setPlaceholderProps({});
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    if(source.droppableId === 'task_status'){
      if (!state[source.index]) return
      const items = reorder(state, source.index, destination.index)
      setState(items)

      await reorderTaskStatus({
        projectId: projectId,
        statusId: state[source.index].id,
        oldIndex: source.index,
        newIndex: destination.index
      })
      return
    }

    const sInd = Number(source.droppableId)
    const dInd = Number(destination.droppableId)
    if (!Number.isInteger(sInd) || !Number.isInteger(dInd) || !state[sInd] || !state[dInd]) return

    const newState = state.map((column) => ({ ...column, content: [...column.content] }))
    if (sInd === dInd) {
      const items = reorder(state[sInd].content, source.index, destination.index);
      newState[sInd].content = items;
    } else {
      const movedItems = move(state[sInd].content, state[dInd].content, source, destination);
      newState[sInd].content = movedItems[source.droppableId] ?? []
      newState[dInd].content = movedItems[destination.droppableId] ?? []
    }
    setState(newState)

    const movedTaskId = newState[dInd].content[destination.index]?.id
    if (!movedTaskId) return

    await reorderTask({
      taskId: movedTaskId,
      statusId: state[sInd].id,
      newStatusId: state[dInd].id,
      oldIndex: source.index,
      newIndex: destination.index,
    })
    return
  }, [projectId, state])

  const onDragUpdate = useCallback((event: DragUpdate) => {
    if (!event.destination) {
      return;
    }

    const draggedDOM = getDraggedDom(event.draggableId);

    if (!draggedDOM) {
      return;
    }

    const { clientHeight, clientWidth } = draggedDOM;
    const destinationIndex = event.destination.index;
    const sourceIndex = event.source.index;

    const sourceParent = draggedDOM.parentElement
    if (!sourceParent) return
    const childrenArray = [...sourceParent.children];
    const movedItem = childrenArray[sourceIndex];
    childrenArray.splice(sourceIndex, 1);

    const droppedDom = getDestinationDom(event.destination.droppableId);
    if (!droppedDom) return
    const destinationChildrenArray = [...droppedDom.children];
    let updatedArray: Element[];
    if (sourceParent === droppedDom) {
      updatedArray = [
        ...childrenArray.slice(0, destinationIndex),
        movedItem,
        ...childrenArray.slice(destinationIndex + 1)
      ];
    } else {
      updatedArray = [
        ...destinationChildrenArray.slice(0, destinationIndex),
        movedItem,
        ...destinationChildrenArray.slice(destinationIndex + 1)
      ];
    }

    const clientY =
      (Number.parseFloat(window.getComputedStyle(sourceParent).paddingTop) || 0) +
      updatedArray.slice(0, destinationIndex).reduce((total, curr) => {
        const marginBottom = Number.parseFloat(window.getComputedStyle(curr).marginBottom) || 0
        return total + curr.clientHeight + marginBottom;
      }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY,
      clientX: Number.parseFloat(window.getComputedStyle(sourceParent).paddingLeft) || 0
    });
  }, [])

  const onDragStart = useCallback((event: DragStart) => {
    const draggedDOM = getDraggedDom(event.draggableId);

    if (!draggedDOM) {
      return;
    }

    const { clientHeight, clientWidth } = draggedDOM;
    const sourceIndex = event.source.index;
    const sourceParent = draggedDOM.parentElement
    if (!sourceParent) return
    const clientY =
      (Number.parseFloat(window.getComputedStyle(sourceParent).paddingTop) || 0) +
      [...sourceParent.children]
        .slice(0, sourceIndex)
        .reduce((total, curr) => {
          const marginBottom = Number.parseFloat(window.getComputedStyle(curr).marginBottom) || 0
          return total + curr.clientHeight + marginBottom;
        }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY,
      clientX: Number.parseFloat(window.getComputedStyle(sourceParent).paddingLeft) || 0
    });
  }, [])

  const handleAssigneeChange = (val: string | null) => {
    setFilterAssignee(val)
  }

  const handleLabelChange = (val: string | null) => {
    setFilterLabel(val)
  }

  const filterTaskData = (taskData: BoardTask[]) => {
    const filterBySearch = taskData.filter(task => task.taskName.toLowerCase().includes(query))

    const filterByAssignee = filterAssignee ? filterBySearch.filter(task => task.assignedTo?.id === filterAssignee) : filterBySearch

    const filterByLabel = filterLabel ? filterByAssignee.filter(task => (task.labels?.find(label => label.id === filterLabel) != undefined)) : filterByAssignee

    return filterByLabel
  }

  const resetFilter = () =>{
    setFilterAssignee(null)
    setFilterLabel(null)
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      {loading && <PopUpLoad/>}
      <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
        <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6 z-[9990]">
          <SearchBar placeholder={"Cari tugas..."} handleSearch={handleSearch}/>
          <div className="relative">
            <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
              <FilterIcon size={20}/>
            </button>
            <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
              <SelectButton
                  name={"board-assignee-button"}
                  options={[{label: "Penerima", value: null},...teamOptions]}
                  onChange={handleAssigneeChange}
                  reset={!filterAssignee}
              />
              <SelectButton
                  name={"board-label-button"}
                  options={[{label: "Label", value: null},...labelOptions]}
                  onChange={handleLabelChange}
                  reset={!filterLabel}
              />
            {(filterAssignee || filterLabel) &&
              <Button variant="primary" size="sm" onClick={() => resetFilter()}>
                <div className="flex items-center gap-2">
                  <CloseFilterIcon size={16}/>
                  <p>Hapus Filter</p>
                </div>
              </Button>}
            </div>
          </div>
        </div>
      </div>
      {updateConfirmation && activeStatus &&
        <UpdateStatusForm
          {...activeStatus}
          onSubmit={handleUpdateStatus}
          onClose={hideUpdateForm}
        />
      }
      {deleteConfirmation && activeStatus &&
        <DeleteStatusForm
          {...activeStatus}
          statusOptions={boardState
            .filter(status => status.id !== activeStatus.id)
            .map(status => ({
              label: status.status,
              value: status.id
            }))}
          onSubmit={handleDeleteStatus}
          onClose={hideDeleteForm}
        />
      }
      <div className="h-full flex items-start overflow-y-auto pb-4">
        <DragDropContext
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
        >
          <Droppable droppableId="task_status" direction="horizontal" type="ISSUE-STATUS" isDropDisabled={!validateUserRole({ userRole: role, minimumRole: 'Owner'})}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                className="h-full flex items-start"
                {...provided.droppableProps}
              >
                {boardState.map((el, ind) => (
                  <Draggable draggableId={el.id} index={ind} key={el.id} isDragDisabled={!validateUserRole({ userRole: role, minimumRole: 'Owner'})}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="custom-scrollbar min-h-[280px] max-h-full flex-shrink-0 mr-4 flex flex-col p-2 gap-4 bg-gray-200 rounded-md overflow-y-auto"
                      >
                        <div className="flex items-center gap-2 px-1 text-dark-blue/80">
                          <div className="uppercase flex-grow text-xs md:text-sm font-semibold flex items-center gap-1 py-1.5"><span>{el.status}</span>
                            <span className="text-[10.8px] md:text-xs">({filterTaskData(el.content).length})</span>
                           { project && <span>{project.endStatus === el.id && <CheckIcon size={14} className="text-green-700"/>}</span>}
                          </div>
                          {validateUserRole({ userRole: role, minimumRole: 'Owner' }) &&
                            <DotButton
                              name={`taskStatus-${el.id}`}
                              actions={[
                                {
                                  label: "Ubah Nama Status",
                                  fnCall: () => showUpdateForm(el),
                                },
                                {
                                  label: "Hapus",
                                  fnCall: () => showDeleteForm(el),
                                  disableFn: boardState.length <= 1
                                },
                              ]}
                              hoverClass={"hover:bg-gray-300"}
                            />
                          }
                        </div>
                        <BoardList
                          items={filterTaskData(el.content)}
                          placeholderProps={placeholderProps}
                          droppableId={`${ind}`}
                        >
                          {el.id === activeStatusId && (
                            isCreatingTask ?
                            <div className="w-full flex justify-center">
                              <TailSpin width={32} height={32} color="#47389F"/>
                            </div> :
                            <SimpleInputForm
                              maxLength={50}
                              name={"taskName"}
                              onSubmit={createTask}
                              onBlur={() => setActiveStatusId(null)}
                              placeholder="Apa yang ingin dikerjakan?"
                            />
                          )}
                        </BoardList>
                        {validateUserRole({ userRole: role, minimumRole: 'Member' }) &&
                        <Button variant="gray" outline onClick={() => showTaskCard(el.id)} className={`${el.id === activeStatusId ? "hidden" : ""}`}>
                          <div className={`flex justify-center items-center gap-2`}>
                            <PlusIcon size={16}/>
                            <p>Tambah Tugas Baru</p>
                          </div>
                        </Button>}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {!isCreatingList && validateUserRole({ userRole: role, minimumRole: 'Owner' }) &&
        <Button
          variant="primary"
          className={"w-[278px] flex-shrink-0"}
          onClick={() => setCreatingList(true)}
        >
          <div className="flex items-center gap-2">
            <PlusIcon size={16}/>
            <p>Tambah Status</p>
          </div>
        </Button>}
        {isCreatingList &&
        (<div className="w-[278px] flex-shrink-0">
          <SimpleInputForm
            maxLength={20}
            name={"taskStatusName"}
            placeholder="Nama status..."
            onSubmit={createTaskStatus}
            onBlur={() => setCreatingList(false)}
          />
        </div>)}
      </div>
    </div>
  );
}
