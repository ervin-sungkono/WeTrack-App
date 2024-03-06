import { Draggable } from "@hello-pangea/dnd"

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: '10px 16px',
    borderRadius: '4px',
    marginBottom: '8px',
  
    // change background colour if dragging
    background: isDragging ? "lightgreen" : "white",
  
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
              {item.content}
            </div>
          )}
        </Draggable>
      );
}