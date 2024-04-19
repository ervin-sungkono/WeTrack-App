"use client"
import { Draggable } from "@hello-pangea/dnd"
import { useEffect, useState } from "react";
import { FaCheckSquare as CheckIcon } from "react-icons/fa";
import { useTaskData } from "@/app/lib/context/task";
import DotButton from "../../common/button/DotButton";
import UserSelectButton from "../../common/UserSelectButton";
import CustomTooltip from "../../common/CustomTooltip";

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
  
    // change background colour if dragging
    background: isDragging ? "rgba(255,255,255,0.7)" : "white",
    pointerEvents: isDragging ? "none" : "",

    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  
    // styles we need to apply on draggables
    ...draggableStyle
})

export default function BoardItem({ item, index }){
    const { viewTask } = useTaskData()
    const [assignee, setAssignee] = useState(item.assignedTo)

    useEffect(() => {
      if(assignee){
        console.log(assignee)
        // Logic untuk update assignee
      }
    }, [assignee])

    const userList = [
      {
          user: {
              id: "WeEzNxSREEdyDpSXkIYCAyA4E8y1",
              fullName: "Ervin Cahyadinata Sungkono",
              profileImage: null
          }
      },
      {
          user: {
              id: "02",
              fullName: "Kenneth Nathanael",
              profileImage: null
          }
      },
      {
          user: {
              id: "03",
              fullName: "Christopher Vinantius",
              profileImage: null
          }
      }
    ]

    return (
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
              )}
              onClick={() => viewTask(item.id)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <p className="flex-grow text-xs md:text-sm font-semibold">{item.taskName}</p>
                <DotButton name={`task-${item.id}`}/>
              </div>
              {(item.label?.length > 0) && (
                <div className="flex flex-wrap">
                  {item.label.map(label => {

                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex flex-grow items-center gap-1 text-dark-blue">
                  <CheckIcon size={16}/>
                  <p className="text-[10px] md:text-xs">TASK-1</p>
                </div>
                <CustomTooltip id={`task-${item.id}-tooltip`} content={assignee?.fullName ?? "Belum ditugaskan"}>
                  <UserSelectButton 
                    name={`assignedTo-${item.id}`}
                    type="icon"
                    placeholder={item.assignedTo}
                    options={userList}
                    onChange={(value) => setAssignee(value)}
                  />
                </CustomTooltip>
            </div>
          </div>
        )}
      </Draggable>
    );
}