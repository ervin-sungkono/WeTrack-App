"use client"
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from "@fullcalendar/core/locales/id";
import { useState, useEffect, createElement } from "react";
import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import { GoArrowRight as ArrowIcon } from "react-icons/go";
import { FaCalendarAlt as CalendarIcon } from "react-icons/fa"
import Label from "../Label";
import UserIcon from "../UserIcon";
import CustomPopover from "../CustomPopover";
import { updateTask } from "@/app/lib/fetch/task";

export default function Calendar({projectKey, projectId, tasks, isEditable}){
    const [formattedTasks, setFormattedTasks] = useState([])

    useEffect(() => {
        setFormattedTasks(tasks.map(task => {
            return {
                id: task.id,
                href: `/projects/${projectId}/tasks?taskId=${task.id}`,
                displayId: `${projectKey}-${task.displayId}`,
                title: `${projectKey}-${task.displayId}: ${task.taskName}`,
                displayTitle: task.taskName,
                start: task.startDate,
                end: task.dueDate,
                finish: task.finishedDate || null,
                allDay: true,
                type: task.type,
                // assignedTo: task.assignedToData?.fullName || null,
                // assignedToImage: task.assignedToData?.profileImage?.attachmentStoragePath || null,
                // status: task.statusData?.statusName,
                // priority: task.priority,
                backgroundColor: task.type === "Task" ? "#47389F" : "#E3D55B",
                textColor: task.type === "Task" ? "#FFFFFF" : "#000000",
            };
        }));
    }, [tasks, projectKey, projectId])

    const renderEventContent = (eventInfo) => {
        const { href, type, displayId, displayTitle, finish } = eventInfo.event.extendedProps
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
                                        {finish === null ? (
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
                                            {assignedTo === null ? (
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
                    zIndex: 9998,
                },
            }, eventInfo.event.title)
        );
    };

    const handleEventDrop = async (dropInfo) => {
        const updatedEvent = {
            ...dropInfo.event.extendedProps,
            title: dropInfo.event.title,
            backgroundColor: dropInfo.event.backgroundColor,
            textColor: dropInfo.event.textColor,
            id: dropInfo.event.id,
            start: dropInfo.event.startStr,
            end: dropInfo.event.endStr,
        };
        setFormattedTasks(prevTasks => prevTasks.map(task => task.id === updatedEvent.id ? updatedEvent : task));
        await updateTask({ taskId: updatedEvent.id, startDate: updatedEvent.start, dueDate: updatedEvent.end });
    };

    const handleEventResize = async (resizeInfo) => {
        const updatedEvent = {
            ...resizeInfo.event.extendedProps,
            title: resizeInfo.event.title,
            backgroundColor: resizeInfo.event.backgroundColor,
            textColor: resizeInfo.event.textColor,
            id: resizeInfo.event.id,
            start: resizeInfo.event.startStr,
            end: resizeInfo.event.endStr,
        };
        setFormattedTasks(prevTasks => prevTasks.map(task => task.id === updatedEvent.id ? updatedEvent : task));
        await updateTask({ taskId: updatedEvent.id, startDate: updatedEvent.start, dueDate: updatedEvent.end });
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
            showNonCurrentDates={false}
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
        />
    )
}