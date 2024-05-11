"use client"
import { memo } from "react"
import { Droppable } from "@hello-pangea/dnd"
import BoardItem from "./BoardItem"

const getListStyle = isDraggingOver => ({
    position: 'relative',
    width: 270,
    flexGrow: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
    marginRight: '-8px',
    paddingRight: '8px'
})

function BoardList({ items, placeholderProps, droppableId, children }){
    return(
        <Droppable droppableId={droppableId} type="ISSUE">
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef} 
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                    className="custom-scrollbar"
                >
                    {items.map((item, index) => (
                        <BoardItem item={item} index={index} key={item.id} />
                    ))}
                    {provided.placeholder}
                    {snapshot.isDraggingOver && (
                        <div
                            className="absolute border bg-gray-400 rounded"
                            style={{
                                top: placeholderProps.clientY,
                                left: placeholderProps.clientX,
                                height: placeholderProps.clientHeight,
                                width: placeholderProps.clientWidth
                            }}
                        />
                    )}
                    {children}
                </div>
            )}
        </Droppable>
    )
}

export default memo(BoardList)