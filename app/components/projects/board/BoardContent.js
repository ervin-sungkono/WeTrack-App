"use client"
import { useEffect, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import BoardList from "./BoardList"
import SearchBar from "../../common/SearchBar"
import SelectButton from "../../common/button/SelectButton"
import SimpleInputForm from "../../common/SimpleInputField"
import Button from "../../common/button/Button"
import { RevolvingDot } from "react-loader-spinner"

import { IoFilter as FilterIcon } from "react-icons/io5"
import { FiPlus as PlusIcon } from "react-icons/fi"
import { useSessionStorage } from "@uidotdev/usehooks"
import { createNewTask, getAllTask } from "@/app/lib/fetch/task"
import DotButton from "../../common/button/DotButton"

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

export default function BoardContent() {
  const [loading, setLoading] = useState(true)
  const [isCreatingTask, setCreatingTask] = useState(false)
  const [isCreatingList, setCreatingList] = useState(false)
  const [state, setState] = useState(null);
  const [query, setQuery] = useState("")
  const [filterDropdown, setFilterDropdown] = useState(false)
  const [project, _] = useSessionStorage("project")
  const [projectId, setProjectId] = useState()
  const [activeStatusId, setActiveStatusId] = useState()

  const showTaskCard = (statusId) => {
    setActiveStatusId(statusId)
  }

  const createTask = async(e) => {
    e.preventDefault()
    setCreatingTask(true)

    const formData = new FormData(document.querySelector(`#taskName-form`))
    const taskName = formData.get("taskName")
    
    createNewTask({
      taskName, 
      projectId: project.id, 
      statusId: activeStatusId
    }).then(res => {
      if(res.data){
        console.log(res.data)
        setState(state.map(el => {
          if(el.id === activeStatusId){
            return({
              ...el,
              content: [...el.content, res.data]
            })
          }
          return el
        }))
      }
      else{
        alert("Gagal membuat tugas baru")
      }
    })

    setCreatingTask(false)
    setActiveStatusId(null)
  }

  const createTaskStatus = (e) => {
    
  }

  useEffect(() => {
    if(project && project.id !== projectId){
      setLoading(true)
      getAllTask(project.id).then(res => {
        if(res.data) {
          setState(project.taskStatusList
            .map(taskStatus => ({
              ...taskStatus,
              content: res.data?.filter(task => task.status.id === taskStatus.id) ?? []
            })
          ))
          setProjectId(project.id)
        }
        else alert("Gagal memperoleh data tugas")

        setLoading(false)
      })
    }
  }, [project, projectId])

  const handleSearch = (query) => {
    setQuery(query.toLowerCase())
  }

  function onDragEnd(result) {
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
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="flex flex-col xs:flex-row justify-between gap-4 items-center">
        <div className="w-full flex justify-center xs:justify-start items-center gap-3 md:gap-6"> 
          <SearchBar placeholder={"Cari tugas.."} handleSearch={handleSearch}/>
          <div className="relative">
            <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
              <FilterIcon size={20}/>
            </button>
            <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
              <SelectButton 
                  name={"assignee-button"}
                  placeholder={"Penerima"}
              />
              <SelectButton 
                  name={"epic-button"}
                  placeholder={"Epic"}
              />
              <SelectButton 
                  name={"label-button"}
                  placeholder={"Label"}
              />
            </div>
          </div>
        </div>
      </div>
      {loading ? 
      <div className='w-full h-full flex flex-col gap-4 justify-center items-center'>
        <RevolvingDot
            height="100"
            width="100"
            radius="48"
            color="#47389F"
        />
        <p className='text-sm md:text-base text-dark/80'>Memuat data tugas...</p>
      </div> : 
      <div className="h-full flex items-start overflow-y-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="task_status" direction="horizontal" type="ISSUE-STATUS">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className="h-full flex items-start" 
                {...provided.droppableProps}
              >
                {state?.map((el, ind) => (
                  <Draggable draggableId={el.id} index={ind} key={el.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="custom-scrollbar min-h-[280px] max-h-full flex-shrink-0 mr-4 flex flex-col p-2 gap-4 bg-gray-200 rounded-md overflow-y-auto"
                      >
                        <div className="flex items-center gap-2 px-1 text-dark-blue/80">
                          <div className="uppercase flex-grow text-xs md:text-sm font-semibold">{el.status} <span className="text-[10.8px] md:text-xs">({el.content.filter(task => task.taskName.toLowerCase().includes(query)).length})</span></div>
                          <DotButton 
                            name={`taskStatus-${el.id}`} 
                            actions={[]}
                            hoverClass={"hover:bg-gray-300"}
                          />
                        </div>
                        <BoardList 
                          items={el.content.filter(task => task.taskName.toLowerCase().includes(query))} 
                          droppableId={`${ind}`}
                        >
                          {el.id === activeStatusId && (
                            isCreatingTask ? 
                            <div>Loading..</div> :
                            <SimpleInputForm
                            name={"taskName"}
                            onSubmit={(e) => createTask(e)}
                            onBlur={() => setActiveStatusId(null)}
                            placeholder="Apa yang ingin dikerjakan?"
                            />
                          )}
                        </BoardList>
                        <Button variant="gray" outline onClick={() => showTaskCard(el.id)} className={`${el.id === activeStatusId ? "hidden" : ""}`}>
                          <div className={`flex justify-center items-center gap-2`}>
                            <PlusIcon size={16}/>
                            <p>Tambah Tugas Baru</p>
                          </div>
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {!isCreatingList && <Button 
          variant="primary" 
          className={"w-[278px] flex-shrink-0"} 
          onClick={() => setCreatingList(true)}
        >
          <div className="flex items-center gap-2">
            <PlusIcon size={16}/>
            <p>Add List</p>
          </div>
        </Button>}
        {isCreatingList && 
        (<div className="w-[278px] flex-shrink-0">
          <SimpleInputForm
            name={"taskStatusName"}
            placeholder=""
            onSubmit={(e) => createTaskStatus(e)}
            onBlur={() => setCreatingList(false)}
          />
        </div>)}
      </div>}
    </div>
  );
}
