"use client"
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import idLocale from "@fullcalendar/core/locales/id";
import { createElement, useRef, useState, useEffect } from "react";
import { dateFormat } from "@/app/lib/date";
import { getPriority } from "@/app/lib/string";
import { FaCheckSquare as TaskIcon } from "react-icons/fa";
import { RiCheckboxMultipleFill as SubTaskIcon } from "react-icons/ri";
import Label from "../Label";
import UserIcon from "../UserIcon";
import { IoIosCloseCircle as CloseCircle } from "react-icons/io";

export default function Calendar({projectKey, projectId, tasks}){
    const [selectedEvent, setSelectedEvent] = useState(null);
    const taskCardRef = useRef(null);

    useEffect(() => {
        if (selectedEvent && taskCardRef.current) {
            taskCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedEvent]);

    const formattedTasks = tasks.map(task => {
        return {
            id: task.id,
            href: `/projects/${projectId}/tasks?taskId=${task.id}`,
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
            editable: true,
        }
    })

    const SelectedTaskCard = ({ event }) => {
        const {
            href,
            displayTitle,
            status,
            priority,
            assignedTo,
            assignedToImage,
            type,
            displayId,
        } = event.extendedProps;
        
        return (
            <div className="relative" ref={taskCardRef}>
                <CloseCircle onClick={() => setSelectedEvent(null)} className="absolute -top-2 md:-top-3 -right-3 text-xl md:text-3xl text-danger-red cursor-pointer"/>
                <div className={`bg-white text-basic-blue p-3 md:p-6 rounded-xl shadow-lg flex gap-6 justify-between`}>
                    <div className="flex flex-col justify-between w-3/5">
                        <div className="text-sm md:text-base font-semibold md:font-bold">{displayTitle}</div>
                        <div className="text-xs md:text-sm">{dateFormat(event.start)} - {dateFormat(event.end)}</div>
                            <div className="mt-4 flex flex-col gap-1">
                                <div className="flex gap-1 font-semibold md:font-bold text-xs md:text-sm w-fit items-center">
                                    Status: <Label text={status.toUpperCase()} />
                                </div>
                                <div className="flex gap-1 font-semibold md:font-bold text-xs md:text-sm w-fit items-center">
                                    Prioritas: <Label text={getPriority(priority).label.toUpperCase()} color={getPriority(priority).color} />
                                </div>
                                <div className="mt-1 flex gap-1 font-semibold md:font-bold text-xs md:text-sm w-fit items-center">
                                    Penerima:
                                <div className="flex gap-1 items-center">
                                    {assignedTo && <UserIcon fullName={assignedTo} src={assignedToImage} size="xs" />}
                                    {assignedTo || "Belum Ditugaskan"}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col justify-between w-2/5">
                        <div className="text-xs md:text-sm flex items-center justify-end gap-1">
                            {type === "Task" ? <TaskIcon className="text-base md:text-xl" /> : <SubTaskIcon className="text-base md:text-xl" />}
                            {displayId}
                        </div>
                        <a href={href}>
                            <div className="text-xs md:text-sm hover:brightness-75 cursor-pointer font-semibold md:font-bold">{`Lihat Rincian ->`}</div>
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    const renderEventContent = (eventInfo) => (
        createElement('a', {
            style: { 
                color: eventInfo.event.textColor, 
                cursor: "pointer",
                overflow: "hidden",
                padding: "0 0.25rem",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                display: "inline-block",
                maxWidth: "100%"
            },
            onClick: (e) => {
                e.preventDefault();
                setSelectedEvent(eventInfo.event);
            }
        }, eventInfo.event.title)
    );

    const handleEventDrop = (dropInfo) => {
        const updatedEvent = {
            ...dropInfo.event,
            start: dropInfo.event.startStr,
            end: dropInfo.event.endStr,
        };
        console.log(updatedEvent)
    };

    const handleEventResize = (resizeInfo) => {
        const updatedEvent = {
            ...resizeInfo.event,
            start: resizeInfo.event.startStr,
            end: resizeInfo.event.endStr,
        };
        console.log(updatedEvent)
    };

    return(
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
            weekText="M-"
            height="auto"
            // aspectRatio={1}
            events={formattedTasks}
            eventClick={(clickInfo) => {
                clickInfo.jsEvent.preventDefault();
                setSelectedEvent(clickInfo.event);
            }}
            eventContent={renderEventContent}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
        />
            // {selectedEvent && (
            //     <div className="mb-6">
            //         <SelectedTaskCard event={selectedEvent} />
            //     </div>
            // )}
    )
}