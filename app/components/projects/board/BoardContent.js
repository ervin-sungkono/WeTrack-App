"use client"
import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import BoardList from "./BoardList";
import SearchBar from "../../common/SearchBar";
import SelectButton from "../../common/SelectButton";

import { BsThreeDots as DotIcon } from "react-icons/bs"

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
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
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);
  const [query, setQuery] = useState("")

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
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <div className="w-full flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6">
        <SearchBar placeholder={"Search task.."} handleSearch={handleSearch}/>
        <div className="flex items-center gap-2 md:gap-4">
          <SelectButton 
              name={"status-button"}
              placeholder={"Assignee"}
          />
          <SelectButton 
              name={"status-button"}
              placeholder={"Epic"}
          />
          <SelectButton 
              name={"status-button"}
              placeholder={"Label"}
          />
        </div>
        <div className="flex items-center gap-2">
          <b className="hidden xs:block text-xs md:text-sm">Group By:</b>
          <SelectButton 
              name={"status-button"}
              placeholder={"None"}
          />
        </div>
      </div>
      <div className="h-full flex gap-4 overflow-y-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <div key={ind} className="flex-shrink-0 h-full flex flex-col px-2 py-4 gap-4 bg-gray-200 rounded-md overflow-y-auto pb-4">
              <div className="flex items-center gap-2 px-1 text-dark-blue/80">
                <div className="uppercase flex-grow text-sm md:text-base font-semibold">TODO</div>
                <DotIcon size={20}/>
              </div>
              <BoardList items={el} droppableId={`${ind}`}/>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
