"use client"
import { useEffect, useState } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import BoardList from "./BoardList"
import SearchBar from "../../common/SearchBar"
import SelectButton from "../../common/SelectButton"

import { BsThreeDots as DotIcon } from "react-icons/bs"
import { IoFilter as FilterIcon } from "react-icons/io5"
import useLocalStorage from "@/app/lib/hooks/useLocalStorage"

const getItems = (count, offset = 0, id) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${id}`,
    content: `item ${k + offset}`
}));

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

  useEffect(() => {
    if(project){
      setState(project.issueStatusList
        .map(issueStatus => ({
          ...issueStatus,
          content: getItems(10,0,issueStatus.id)
        })
      ))
    }
  }, [project])

  const handleSearch = (query) => {
    setQuery(query)
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
            <div key={el.id} className="custom-scrollbar max-h-full flex-shrink-0 flex flex-col px-2 py-4 gap-4 bg-gray-200 rounded-md overflow-y-auto pb-4">
              <div className="flex items-center gap-2 px-1 text-dark-blue/80">
                <div className="uppercase flex-grow text-sm md:text-base font-semibold">{el.status}</div>
                <DotIcon size={20}/>
              </div>
              <BoardList items={el.content} droppableId={`${ind}`}/>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
