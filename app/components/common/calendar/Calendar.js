"use client"
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import idLocale from "@fullcalendar/core/locales/id";
import { createElement } from "react";
import CalendarTooltip from "./CalendarTooltip";
import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import Label from "../Label";
import UserIcon from "../UserIcon";

export default function Calendar({projectKey, projectId, tasks}){

    console.log(tasks)

    const formattedTasks = tasks.map(task => {
        return {
            id: task.id,
            // url: `/projects/${projectId}/tasks?taskId=${task.id}`,
            displayId: `${projectKey}-${task.displayId}`,
            title: `${projectKey}-${task.displayId}: ${task.taskName}`,
            displayTitle: task.taskName,
            start: task.startDate,
            end: task.dueDate,
            allDay: true,
            type: task.type,
            assignedTo: task.assignedToData?.fullName,
            assignedToImage: task.assignedToData?.profileImage?.attachmentStoragePath || null,
            status: task.statusData?.statusName,
            priority: task.priority,
            backgroundColor: task.type === "Task" ? "#47389F" : "#E3D55B",
            textColor: task.type === "Task" ? "#FFFFFF" : "#000000",
        }
    })

    const renderEventContent = (eventInfo) => {
        const { type, displayId, displayTitle, assignedTo, assignedToImage, status, priority } = eventInfo.event.extendedProps
        return createElement(
            CalendarTooltip,
            { 
                id: `tooltip-${eventInfo.event.id}`, 
                type: type,
                content: 
                    <>
                        <div className="flex gap-6 justify-between">
                            <div className="flex flex-col justify-between">
                                <div className="text-sm md:text-base font-semibold">{displayTitle}</div>
                                <div className="text-xs md:text-sm">{dateFormat(eventInfo.event.start)} - {dateFormat(eventInfo.event.end)}</div>
                                <div className="mt-4 flex flex-col gap-1">
                                    <div className="flex gap-1 font-semibold text-xs md:text-sm w-fit">
                                        Status:
                                        <Label text={status.toUpperCase()}/>
                                    </div>
                                    <div className="flex gap-1 font-semibold text-xs md:text-sm w-fit">
                                        Prioritas: 
                                        <Label text={getPriority(priority).label.toUpperCase()} color={getPriority(priority).color}/>
                                    </div>
                                    <div className="mt-1 flex gap-1 items-center font-semibold text-xs md:text-sm w-fit">
                                        Penerima:
                                        <div className="flex gap-1 items-center">
                                            {assignedTo && (
                                                <UserIcon fullName={assignedTo} src={assignedToImage} size="sm"/>
                                            )}
                                            {assignedTo || "Belum Ditugaskan"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-between">
                                <div className="text-xs md:text-sm flex items-center justify-end">
                                    {type === "Task" ? <TaskIcon className="text-lg md:text-xl"/> : <SubTaskIcon className="text-lg md:text-xl"/>}
                                    {displayId}
                                </div>
                            </div>
                        </div>
                    </>
            },
            createElement('a', { 
                // href: eventInfo.event.url, 
                style: { 
                    color: eventInfo.event.textColor,
                } 
            }, eventInfo.event.title)
        );
    };

    return(
        <>
            <FullCalendar
                locale={idLocale}
                timeZone="local"
                plugins={[ dayGridPlugin ]}
                initialView="dayGridMonth"
                firstDay={0}
                titleFormat={{
                    year: 'numeric', 
                    month: 'long',
                }}
                headerToolbar={{
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                }}
                dayHeaderFormat={{ 
                    weekday: 'long',
                }}
                footerToolbar={{
                    left: '',
                    center: 'today',
                    right: ''
                }}
                buttonText={{
                    today: 'Ke Tanggal Hari Ini',
                }}
                showNonCurrentDates={false}
                fixedWeekCount={false}
                weekNumbers={true}
                weekNumberFormat={{
                    week: 'short',
                }}
                weekText="Minggu"
                events={formattedTasks}
                eventContent={renderEventContent}
            />
        </>
    )
}