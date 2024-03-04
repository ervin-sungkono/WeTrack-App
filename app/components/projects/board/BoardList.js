import { memo } from "react"
import { Droppable } from "@hello-pangea/dnd"
import BoardItem from "./BoardItem"

const getListStyle = isDraggingOver => ({
    width: 250,
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    marginRight: '-8px',
    paddingRight: '8px'
})

function BoardList({ items, droppableId }){
    return(
        <Droppable droppableId={droppableId} isCombineEnabled>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef} 
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                >
                    {items.map((item, index) => (
                        <BoardItem item={item} index={index} key={item.id} />
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )
}

export default memo(BoardList)