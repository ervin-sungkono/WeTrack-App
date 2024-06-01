"use client"
import { Draggable } from "@hello-pangea/dnd"
import { FaCheckSquare as CheckIcon } from "react-icons/fa";
import { useTaskData } from "@/app/lib/context/task";
import { useSessionStorage } from "usehooks-ts";

import DotButton from "../../common/button/DotButton";
import CustomTooltip from "../../common/CustomTooltip";
import Label from "../../common/Label";
import UserIcon from "../../common/UserIcon";

import { validateUserRole } from "@/app/lib/helper";
import { useRole } from "@/app/lib/context/role";
import { getPriority } from "@/app/lib/string";

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
  
    // change background colour if dragging
    background: "white",
    pointerEvents: isDragging ? "none" : "",
    cursor: "pointer",

    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    // styles we need to apply on draggables
    ...draggableStyle,
})

export default function BoardItem({ item, index }){
    const { viewTask, focusUpdateTask, focusDeleteTask } = useTaskData()
    const [project, _] = useSessionStorage("project")

    const role = useRole()

    const taskActions = [
      {
        label: "Ubah Nama Tugas",
        fnCall: () => focusUpdateTask(item)
      },
      {
        label: "Hapus",
        fnCall: () => focusDeleteTask(item)
      }
    ]

    const {label: priorityLabel, color: priorityColor} = getPriority(item.priority)
    return (
        <Draggable draggableId={item.id} index={index} isDragDisabled={!validateUserRole({ userRole: role, minimumRole: 'Member'})}>
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
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="flex-grow text-xs md:text-sm font-semibold py-1.5">{item.taskName}</p>
                  {validateUserRole({ userRole: role, minimumRole: 'Member' }) && 
                  <DotButton 
                    name={`task-${item.id}`}
                    actions={taskActions}
                  />}
                </div>
                {item.labels && (
                  <div className="flex flex-wrap gap-1">
                    {item.labels.map(({id, content, backgroundColor}) => (
                      <Label key={id} text={content} color={backgroundColor}/>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                  <div className="flex flex-grow items-center gap-1 text-dark-blue">
                    <CheckIcon size={16}/>
                    <p className="text-[10px] md:text-xs">{project && <span>{project.key}-{item.displayId}</span>}</p>
                  </div>
                  {item.priority !== 0 && 
                  <CustomTooltip id={`task-${item.id}-priority-tooltip`} content={`Prioritas: ${priorityLabel}`}>
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: priorityColor}}></div>
                  </CustomTooltip>}
                  <CustomTooltip id={`task-${item.id}-tooltip`} content={item.assignedTo?.fullName ?? "Belum Ditugaskan"}>
                    <UserIcon 
                      size="sm"
                      src={item.assignedTo ? item.assignedTo.profileImage?.attachmentStoragePath : '/images/user-placeholder.png'}
                      fullName={item.assignedTo?.fullName}
                    />
                  </CustomTooltip>
              </div>
            </div>
          )}
        </Draggable> 
    );
}