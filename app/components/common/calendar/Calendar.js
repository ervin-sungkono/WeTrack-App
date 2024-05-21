"use client"
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import idLocale from "@fullcalendar/core/locales/id";

export default function Calendar({projectKey, projectId, tasks}){

    const formattedTasks = tasks.map(task => {
        return {
            id: task.id,
            url: `/projects/${projectId}/tasks?taskId=${task.id}`,
            title: `${projectKey}-${task.displayId}: ${task.taskName}`,
            start: task.startDate,
            end: task.dueDate,
            allDay: true,
            backgroundColor: task.type === "Task" ? "#47389F" : "#E3D55B",
            textColor: task.type === "Task" ? "#FFFFFF" : "#000000",
        }
    })

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
                height={600}
                showNonCurrentDates={false}
                fixedWeekCount={false}
                weekNumbers={true}
                weekNumberFormat={{
                    week: 'short',
                }}
                weekText="Minggu"
                events={formattedTasks}
            />
        </>
    )
}