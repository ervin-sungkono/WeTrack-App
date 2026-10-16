"use client"
import { memo, type CSSProperties, type ReactNode } from "react"
import { Droppable } from "@hello-pangea/dnd"
import BoardItem from "./BoardItem"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"
import type { BoardTask, PlaceholderProperties } from "../../types"

interface BoardListProps {
    items: BoardTask[]
    placeholderProps: PlaceholderProperties
    droppableId: string
    children?: ReactNode
}

const getListStyle = (): CSSProperties => ({
    position: 'relative',
    width: 270,
    flexGrow: 1,
    overflowX: 'hidden',
    overflowY: 'auto',
    marginRight: '-8px',
    paddingRight: '8px'
})

function BoardList({ items, placeholderProps, droppableId, children }: BoardListProps){
    const role = useRole()
    return(
        <Droppable droppableId={droppableId} type="ISSUE" isDropDisabled={!validateUserRole({ userRole: role, minimumRole: 'Member'})}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    style={getListStyle()}
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
