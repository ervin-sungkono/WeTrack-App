"use client"
import { Draggable } from "@hello-pangea/dnd"
import { useState } from "react";
import { FaCheckSquare as CheckIcon } from "react-icons/fa";
import { useTaskData } from "@/app/lib/context/task";
import { useSessionStorage } from "usehooks-ts";

import DotButton from "../../common/button/DotButton";
import CustomTooltip from "../../common/CustomTooltip";
import Label from "../../common/Label";
import PopUpForm from "../../common/alert/PopUpForm";
import Button from "../../common/button/Button";
import PopUpLoad from "../../common/alert/PopUpLoad";
import UpdateTaskNameForm from "../../common/form/UpdateTaskNameForm";
import UserIcon from "../../common/UserIcon";

import { deleteTask, updateTask } from "@/app/lib/fetch/task";
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
    const { viewTask } = useTaskData()
    const [loading, setLoading] = useState(false)
    const [updateConfirmation, setUpdateConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [project, _] = useSessionStorage("project")

    const role = useRole()

    const taskActions = [
      {
        label: "Ubah Nama Tugas",
        fnCall: () => setUpdateConfirmation(true)
      },
      {
        label: "Hapus",
        fnCall: () => setDeleteConfirmation(true)
      }
    ]

    const handleUpdateTaskName = async(e, taskName) => {
      e.stopPropagation()
      setLoading(true)

      try{
        if(taskName !== item.taskName) await updateTask({ taskId: item.id, taskName })
      }catch(e){
        console.log(e)
      }finally{
        setUpdateConfirmation(false)
        setLoading(false)
      }
    }

    const handleDeleteTask = async(e) => {
      e.stopPropagation()
      setLoading(true)

      try{
        await deleteTask({ taskId: item.id })
      }catch(e){
        console.log(e)
      }finally{
        setDeleteConfirmation(false)
        setLoading(false)
      }
    }

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
            {loading && <PopUpLoad/>}
            {updateConfirmation &&
              <UpdateTaskNameForm 
                taskName={item.taskName} 
                onSubmit={handleUpdateTaskName} 
                onClose={(e) => {
                  e.stopPropagation()
                  setUpdateConfirmation(false)
                }}
              />
            }
            {deleteConfirmation &&
              (<PopUpForm
                title={"Hapus Tugas"}
                titleSize="large"
                message={'Apakah Anda yakin ingin menghapus tugas ini?'}
                wrapContent
              >
                <>
                  <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteTask}>Hapus</Button>
                    <Button variant="secondary" onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmation(false)
                      }}
                    >Batal</Button>
                  </div>
                </>
              </PopUpForm>)
            }
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
                    src={item.assignedTo ? item.assignedTo.profileImage : '/images/user-placeholder.png'}
                    fullName={item.assignedTo?.fullName}
                  />
                </CustomTooltip>
            </div>
          </div>
        )}
      </Draggable>
    );
}