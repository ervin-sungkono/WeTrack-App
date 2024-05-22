"use client"
import { useCallback, useEffect, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { createNewTask, reorderTask } from "@/app/lib/fetch/task"
import { createNewTaskStatus, deleteTaskStatus, reorderTaskStatus, updateTaskStatus } from "@/app/lib/fetch/taskStatus"
import { getDocumentReference, getQueryReferenceOrderBy, getTaskReferenceOrderBy } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import { debounce, validateUserRole } from "@/app/lib/helper"

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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
}

export default function BoardContent({ projectId }){
  const [isCreatingTask, setCreatingTask] = useState(false)
  const [isCreatingList, setCreatingList] = useState(false)
  const [state, setState] = useState(null);
  const [query, setQuery] = useState("")
  const [filterDropdown, setFilterDropdown] = useState(false)
  const [activeStatusId, setActiveStatusId] = useState()
  const [activeStatus, setActiveStatus] = useState()
  const [updateConfirmation, setUpdateConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [taskStatusData, setTaskStatusData] = useState()
  const [taskData, setTaskData] = useState()
  const [placeholderProps, setPlaceholderProps] = useState({});
  const [project, _] = useSessionStorage("project")
  const [loading, setLoading] = useState(false)

  const [teamOptions, setTeamOptions] = useState([])
  const [labelOptions, setLabelOptions] = useState([])
  const [filterAssignee, setFilterAssignee] = useState(null)
  const [filterLabel, setFilterLabel] = useState(null)

  const queryAttr = "data-rfd-draggable-id";
  const destinationQuertAttr = "data-rfd-droppable-id";

  const role = useRole()

  const showTaskCard = (statusId) => {
    setActiveStatusId(statusId)
  }

  const createTask = async(e) => {
    e.preventDefault()
    setCreatingTask(true)

    const formData = new FormData(document.querySelector(`#taskName-form`))
    const taskName = formData.get("taskName")
    
    await createNewTask({
      taskName, 
      projectId: projectId, 
      statusId: activeStatusId
    })

    setCreatingTask(false)
    setActiveStatusId(null)
  }

  const createTaskStatus = (e) => {
    e.preventDefault()

    const formData = new FormData(document.querySelector(`#taskStatusName-form`))
    const statusName = formData.get("taskStatusName")
    
    debounce(
      createNewTaskStatus({
        projectId: projectId, 
        statusName, 
      })
    , 100)

    setCreatingList(false)
  }

  const showDeleteForm = (status) => {
    setActiveStatus(status)
    setDeleteConfirmation(true)
  }

  const showUpdateForm = (status) => {
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

  const handleUpdateStatus = async(values) => {
    setLoading(true)
    try{
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

  const handleDeleteStatus = async(values) => {
    setLoading(true)

    try{
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

  const updateState = useCallback(
    debounce((taskData, taskStatusData) => 
      setState(taskStatusData.map((status) => ({
        ...status,
        content: taskData.filter(task => task.status === status.id)
      })))
    , 300)
  , [])

  useEffect(() => {
    if(!taskData && !taskStatusData) return
    updateState(taskData, taskStatusData)
  }, [taskData, taskStatusData, updateState])

  useEffect(() => {
    if(!projectId) return
    const statusReference = getQueryReferenceOrderBy({ collectionName: "taskStatuses", field: "projectId", id: projectId, orderByKey: "order" })
    const statusUnsubscribe = onSnapshot(statusReference, (async(snapshot) => {
      const taskStatusData = snapshot.docs.map(taskStatusDoc => ({
        id: taskStatusDoc.id,
        status: taskStatusDoc.data().statusName,
        order: taskStatusDoc.data().order
      }))
      setTaskStatusData(taskStatusData)
    }))

    const taskReference = getTaskReferenceOrderBy({ field: "projectId", id: projectId, orderByKey: "order" })
    const taskUnsubscribe = onSnapshot(taskReference, (async(taskSnapshot) => {
      const taskData = await Promise.all(taskSnapshot.docs.map(async(taskDoc) => {
        const taskLabels = taskDoc.data().labels
        const labels = taskLabels && await Promise.all(taskLabels.map(async(label) => {
          const labelSnap = await getDoc(getDocumentReference({ collectionName: "labels", id: label }))
          return {
            id: labelSnap.id,
            ...labelSnap.data()
          }
        }))
        const assignedToId = taskDoc.data().assignedTo
        const assignedToDoc = assignedToId && await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }))
        const assignedTo = assignedToDoc && {id: assignedToDoc.id, ...assignedToDoc.data()}
        return {
          id: taskDoc.id,
          ...taskDoc.data(),
          assignedTo: assignedTo,
          labels: labels
        }
      }))
      setTaskData(taskData)
    }))

    return () => {
      statusUnsubscribe()
      taskUnsubscribe()
    }
  }, [projectId])

  useEffect(() => {
    const fetchTeamOptions = async() => {
      if(!projectId) return
      const teamData = await getAllTeamMember({ projectId })
      if(teamData.data){
          setTeamOptions([
            ...teamData.data.map(team => ({
            value: team.userId,
            label: team.user.fullName
          }))
        ])
      }
    }
    const fetchLabelOptions = async() => {
      if(!projectId) return
      const labelData = await getAllLabel({ projectId })
      if(labelData.data){
          setLabelOptions([
            ...labelData.data.map(label => ({
              value: label.id,
              label: label.content
            }))
          ])
      }
    }
    fetchTeamOptions()
    fetchLabelOptions()
  }, [projectId])

  const handleSearch = (query) => {
    setQuery(query.toLowerCase())
  }

  async function onDragEnd(result) {
    setPlaceholderProps({});
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if(source.droppableId === 'task_status'){
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

    if (sInd === dInd) {
      const items = reorder(state[sInd].content, source.index, destination.index);
      const newState = [...state];
      newState[sInd].content = items;
      setState(newState);
    } else {
      const result = move(state[sInd].content, state[dInd].content, source, destination);
      const newState = [...state];
      newState[sInd].content = result[sInd];
      newState[dInd].content = result[dInd];
      setState(newState)
    }

    await reorderTask({ 
      taskId: state[dInd].content[destination.index].id,
      statusId: state[sInd].id,
      newStatusId: state[dInd].id,
      oldIndex: source.index,
      newIndex: destination.index,
    })
    return
  }

  const onDragUpdate = (event) => {
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

    const childrenArray = [...draggedDOM.parentNode.children];
    const movedItem = childrenArray[sourceIndex];
    childrenArray.splice(sourceIndex, 1);

    const droppedDom = getDestinationDom(event.destination.droppableId);
    const destinationChildrenArray = [...droppedDom.children];
    let updatedArray;
    if (draggedDOM.parentNode === droppedDom) {
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

    var clientY =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
      updatedArray.slice(0, destinationIndex).reduce((total, curr) => {
        const style = curr.currentStyle || window.getComputedStyle(curr);
        const marginBottom = parseFloat(style.marginBottom);
        return total + curr.clientHeight + marginBottom;
      }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY,
      clientX: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingLeft
      )
    });
  };

  const onDragStart = (event) => {
    const draggedDOM = getDraggedDom(event.draggableId);

    if (!draggedDOM) {
      return;
    }

    const { clientHeight, clientWidth } = draggedDOM;
    const sourceIndex = event.source.index;
    var clientY =
      parseFloat(window.getComputedStyle(draggedDOM.parentNode).paddingTop) +
      [...draggedDOM.parentNode.children]
        .slice(0, sourceIndex)
        .reduce((total, curr) => {
          const style = curr.currentStyle || window.getComputedStyle(curr);
          const marginBottom = parseFloat(style.marginBottom);
          return total + curr.clientHeight + marginBottom;
        }, 0);

    setPlaceholderProps({
      clientHeight,
      clientWidth,
      clientY,
      clientX: parseFloat(
        window.getComputedStyle(draggedDOM.parentNode).paddingLeft
      )
    });
  };

  const getDraggedDom = (draggableId) => {
    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);

    return draggedDOM;
  };

  const getDestinationDom = (dropabbleId) => {
    const domQuery = `[${destinationQuertAttr}='${dropabbleId}']`;
    const destinationDOm = document.querySelector(domQuery);
    return destinationDOm;
  };

  const handleAssigneeChange = (val) => {
    setFilterAssignee(val)
  }

  const handleLabelChange = (val) => {
    setFilterLabel(val)
  }

  const filterTaskData = (taskData) => {
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
          <SearchBar placeholder={"Cari tugas.."} handleSearch={handleSearch}/>
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
          statusOptions={state
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
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className="h-full flex items-start" 
                {...provided.droppableProps}
              >
                {state?.map((el, ind) => (
                  <Draggable draggableId={el.id} index={ind} key={el.id} isDragDisabled={!validateUserRole({ userRole: role, minimumRole: 'Owner'})}>
                    {(provided, snapshot) => (
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
                                  disableFn: state.length <= 1
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
            name={"taskStatusName"}
            placeholder="Nama status.."
            onSubmit={createTaskStatus}
            onBlur={() => setCreatingList(false)}
          />
        </div>)}
      </div>
    </div>
  );
}
