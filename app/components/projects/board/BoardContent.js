"use client"
import { useEffect, useState } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import BoardList from "./BoardList"
import SearchBar from "../../common/SearchBar"
import SelectButton from "../../common/SelectButton"
import Button from "../../common/button/Button"

import { BsThreeDots as DotIcon } from "react-icons/bs"
import { IoFilter as FilterIcon } from "react-icons/io5"
import { FiPlus as PlusIcon } from "react-icons/fi"
import useLocalStorage from "@/app/lib/hooks/useLocalStorage"
import { getAllIssue } from "@/app/lib/fetch/issue"

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
  const [state, setState] = useState();
  const [query, setQuery] = useState("")
  const [filterDropdown, setFilterDropdown] = useState(false)
  const [project, _] = useLocalStorage("project")

  const queryAttr = "data-rbd-drag-handle-draggable-id";
  const destinationQuertAttr = "data-rbd-droppable-id";

  const [placeholderProps, setPlaceholderProps] = useState({});

  useEffect(() => {
    if(project){
      getAllIssue(project.id).then(res => {
        if(res.data) {
          setState(project.issueStatusList
            .map(issueStatus => ({
              ...issueStatus,
              content: res.data?.filter(issue => issue.statusId === issueStatus.id) ?? []
            })
          ))
        }
        else alert("Fail to get issue data")
      })
    }
  }, [project])

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
          <SearchBar placeholder={"Search task.."} handleSearch={handleSearch}/>
          <div className="relative">
            <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}>
              <FilterIcon size={20}/>
            </button>
            <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
              <SelectButton 
                  name={"assignee-button"}
                  placeholder={"Assignee"}
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
        <div className="flex flex-shrink-0 items-center gap-2">
          <b className="text-xs md:text-sm">Group By:</b>
          <SelectButton 
              name={"groupby-button"}
              placeholder={"None"}
          />
        </div>
      </div>
      <div className="h-full flex items-start gap-4 overflow-y-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {state?.map((el, ind) => (
            <div key={el.id} className="custom-scrollbar max-h-full flex-shrink-0 flex flex-col p-2 gap-4 bg-gray-200 rounded-md overflow-y-auto">
              <div className="flex items-center gap-2 px-1 text-dark-blue/80">
                <div className="uppercase flex-grow text-xs md:text-sm font-semibold">{el.status} <span className="text-[10px] md:text-xs">({el.content.filter(issue => issue.issueName.toLowerCase().includes(query)).length})</span></div>
                <button className="p-1.5 hover:bg-gray-300 duration-200 transition-colors rounded-sm">
                  <DotIcon size={20}/>
                </button>
              </div>
              <BoardList items={el.content.filter(issue => issue.issueName.toLowerCase().includes(query))} droppableId={`${ind}`}/>
              <Button variant="gray" onClick={() => createIssueCard(el.status)}>
                <div className="flex justify-center items-center gap-2">
                  <PlusIcon size={16}/>
                  <p>Create Issue</p>
                </div>
              </Button>
            </div>
          ))}
        </DragDropContext>
        <Button variant="primary" className={"w-[270px] flex-shrink-0"} onClick={() => setState([...state, {status: "New Status", content: []}])}>
          <div className="flex items-center gap-2">
            <PlusIcon size={16}/>
            <p>Add List</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
