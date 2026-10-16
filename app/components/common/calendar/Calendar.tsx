"use client"
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import idLocale from "@fullcalendar/core/locales/id";
import { useMemo, createElement } from "react";
import type { EventInput, EventContentArg, EventDropArg } from "@fullcalendar/core";
import type { FirestoreTimestampLike, Task } from "@/app/types/domain";
import { dateFormat } from "@/app/lib/date";
// import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import { FaCalendarAlt as CalendarIcon } from "react-icons/fa"
// import Label from "../Label";
// import UserIcon from "../UserIcon";
import CustomPopover from "../CustomPopover";
import { updateTask } from "@/app/lib/fetch/task";
type CalendarTask = Task & { displayId: string | number }
type CalendarProps = { projectKey: string; projectId: string; tasks: CalendarTask[]; isEditable: boolean }
type CalendarEvent = EventInput & {
    id: string
    href: string
    displayId: string
    displayTitle: string
    finish: string | null
    type: Task["type"]
}

function toCalendarDate(value: FirestoreTimestampLike): string | null {
    if (value == null) return null
    if (typeof value === "string") return value
    if (typeof value === "number") return new Date(value * 1000).toISOString().slice(0, 10)
    if (value instanceof Date) return value.toISOString().slice(0, 10)
    if ("toDate" in value && typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10)
    if ("seconds" in value && typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString().slice(0, 10)
    return null
}

export default function Calendar({projectKey, projectId, tasks, isEditable}: CalendarProps){
    const formattedTasks = useMemo<CalendarEvent[]>(() => tasks.map(task => {
            return {
                id: task.id,
                href: `/projects/${projectId}/tasks?taskId=${task.id}`,
                displayId: `${projectKey}-${task.displayId}`,
                title: `${projectKey}-${task.displayId}: ${task.taskName}`,
                displayTitle: task.taskName,
                start: toCalendarDate(task.startDate ?? null) ?? undefined,
                end: toCalendarDate(task.dueDate ?? null) ?? undefined,
                finish: toCalendarDate(task.finishedDate ?? null),
                allDay: true,
                type: task.type,
                // assignedTo: task.assignedToData?.fullName || null,
                // assignedToImage: task.assignedToData?.profileImage?.attachmentStoragePath || null,
                // status: task.statusData?.statusName,
                // priority: task.priority,
                backgroundColor: task.type === "Task" ? "#47389F" : "#E3D55B",
                textColor: task.type === "Task" ? "#FFFFFF" : "#000000",
            };
        }), [tasks, projectKey, projectId])

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { href, type, displayId, displayTitle, finish } = eventInfo.event.extendedProps as CalendarEvent
        return createElement(
            CustomPopover,
            {
                id: `popover-${eventInfo.event.id}`,
                content:
                    <div className="z-fixed">
                        <div className="flex flex-col justify-between p-1 gap-4 rounded-md">
                            <div className="flex flex-col justify-between">
                                <div className="text-sm md:text-base font-semibold">{displayTitle}</div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                            <CalendarIcon className="text-base md:text-lg"/>
                                            Tanggal Mulai: {dateFormat(eventInfo.event.start)}
                                        </div>
                                        {finish == null ? (
                                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                                <CalendarIcon className="text-base md:text-lg"/>
                                                Tenggat Waktu: {dateFormat(eventInfo.event.end)}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs md:text-sm w-fit">
                                                <CalendarIcon className="text-base md:text-lg"/>
                                                Tanggal Selesai: {dateFormat(finish)}
                                            </div>
                                        )}
                                    </div>
                                    {/* <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                                            Status:
                                            <Label text={status.toUpperCase()}/>
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                                            Prioritas:
                                            <Label text={getPriority(priority).label.toUpperCase()} color={getPriority(priority).color}/>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 font-semibold text-xs md:text-sm w-fit">
                                            Penerima:
                                            {assignedTo == null ? (
                                                <>
                                                    <UserIcon src={'/images/user-placeholder.png'} size="xs"/>
                                                    {"Belum Ditugaskan"}
                                                </>
                                            ) : (
                                                <>
                                                    <UserIcon fullName={assignedTo} src={assignedToImage} size="xs"/>
                                                    {assignedTo}
                                                </>
                                            )}
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs md:text-sm flex items-center gap-1 justify-end">
                                    {type === "Task" ? <TaskIcon className="text-lg md:text-xl"/> : <SubTaskIcon className="text-lg md:text-xl"/>}
                                    {displayId}
                                </div>
                                <a href={href}>
                                    <div className="flex items-center gap-1 text-basic-blue hover:text-basic-blue/80">
                                        <div className="text-xs md:text-sm cursor-pointer font-semibold">{`Lihat Rincian`}</div>
                                        <ArrowIcon className="text-base md:text-lg"/>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
            },
            createElement('a', {
                style: {
                    color: eventInfo.event.textColor,
                    overflow: "hidden",
                    padding: "0 0.25rem",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    maxWidth: "100%",
                    zIndex: 100,
                },
            }, eventInfo.event.title)
        );
    };

    const handleEventDrop = async (dropInfo: EventDropArg) => {
        try {
            await updateTask({ taskId: dropInfo.event.id, startDate: dropInfo.event.startStr, dueDate: dropInfo.event.endStr || null });
        } catch {
            dropInfo.revert()
        }
    };

    const handleEventResize = async (resizeInfo: EventResizeDoneArg) => {
        try {
            await updateTask({ taskId: resizeInfo.event.id, startDate: resizeInfo.event.startStr, dueDate: resizeInfo.event.endStr || null });
        } catch {
            resizeInfo.revert()
        }
    };

    return(
        <FullCalendar
            locale={idLocale}
            timeZone="local"
            plugins={[ dayGridPlugin, interactionPlugin ]}
            initialView="dayGridMonth"
            firstDay={0}
            titleFormat={{
                year: 'numeric',
                month: 'long',
            }}
            headerToolbar={{
                left: 'prev,next title',
                center: '',
                right: 'today'
            }}
            dayHeaderFormat={{
                weekday: 'long',
            }}
            buttonText={{
                today: 'Hari Ini',
            }}
            // showNonCurrentDates={false}
            fixedWeekCount={false}
            weekNumbers={true}
            weekNumberFormat={{
                week: 'narrow',
            }}
            weekText="Mg-"
            height="auto"
            events={formattedTasks}
            eventContent={renderEventContent}
            stickyHeaderDates={false}
            editable={isEditable}
            droppable={isEditable}
            eventResizableFromStart={isEditable}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            dayMaxEvents={3}
        />
    )
}
