import { Draggable } from "@hello-pangea/dnd"
import UserIcon from "../../common/UserIcon";
import { FaCheckSquare as CheckIcon } from "react-icons/fa";
import { BsThreeDots as DotIcon } from "react-icons/bs";

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
  
    // change background colour if dragging
    background: isDragging ? "rgba(255,255,255,0.7)" : "white",

    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  
    // styles we need to apply on draggables
    ...draggableStyle
})

export default function BoardItem({ item, index }){
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
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <p className="flex-grow text-xs md:text-sm font-semibold">{item.taskName}</p>
                  <button className="p-1.5 hover:bg-gray-200 duration-200 transition-colors rounded-sm">
                    <DotIcon size={20}/>
                  </button>
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
                  <UserIcon src={item.assignedTo ? item.assignedTo.profileImage : "/user-placeholder.png"} size='sm'/>
              </div>
            </div>
          )}
        </Draggable>
      );
}