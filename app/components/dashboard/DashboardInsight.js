"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import EmptyState from "../common/EmptyState";
import { getPriority, getProgress } from "@/app/lib/string";
import { useEffect, useState } from "react";

ChartJS.defaults.font.family = "'Inter', sans-serif"
ChartJS.defaults.font.size = 14;
ChartJS.defaults.font.style = 'normal';
ChartJS.defaults.font.weight = 700;
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardInsight({project}){
    const [position, setPosition] = useState('right');

    useEffect(() => {
        const handleResize = () => {
            if (window.matchMedia("(min-width: 1280px)").matches) {
                setPosition('right');
            } else {
                setPosition('bottom');
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    let doughnutChartData, doughnutChartOptions, barChartData, barChartOptions;
    if(project != null && project.startStatus != null && project.endStatus != null){
        const projectStartStatus = project.startStatus
        const projectEndStatus = project.endStatus

        const statusData = project?.tasks.reduce((value, task) => {
            let currentDate = new Date()
            let dueDate = null
            let dateDifference = 0
            if(task.dueDate){
                dueDate = new Date(task.dueDate)
                dateDifference = Math.round((dueDate - currentDate) / (1000 * 60 * 60 * 24))
            }
            const statusName = task.status.statusName;
            if(statusName === projectStartStatus){
                if(dueDate && dateDifference < 0){
                    value["Terlambat"] += 1;
                }else{
                    value["Belum Dimulai"] += 1;
                }
            }else if(statusName === projectEndStatus){
                value["Selesai"] += 1;
            }else if(statusName !== projectStartStatus && statusName !== projectEndStatus){
                if(dueDate && dateDifference < 0){
                    value["Terlambat"] += 1;
                }else{
                    value["Dalam Proses"] += 1;
                }
            }
            return value;
        }, {
            "Belum Dimulai": 0,
            "Dalam Proses": 0,
            "Selesai": 0,
            "Terlambat": 0
        });
    
        const statusDataTotal = Object.values(statusData).reduce((total, curr) => total + curr, 0);
        
        const statusDataPercentages = Object.values(statusData).map((value) => {
            return Math.round((value / statusDataTotal) * 100);
        });
        
        const statusDataLabels = Object.keys(statusData).map((key, index) => {
            return `${getProgress(key).label.toUpperCase()} (${statusDataPercentages[index]}%)`;
        });

        const statusDataColors = Object.keys(statusData).map((key) => {
            return getProgress(key).color;
        });
        
        doughnutChartData = {
            labels: statusDataLabels,
            datasets: [
                {
                    data: Object.values(statusData),
                    backgroundColor: statusDataColors,
                    borderColor: statusDataColors,
                    borderWidth: 1,
                },
            ],
        };
        
        doughnutChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: position,
                    labels: {
                        color: 'rgba(0, 0, 0, 1)'
                    }
                },
            },
        };
    
        let priorityData = [0, 0, 0, 0];

        priorityData = project?.tasks.reduce((value, task) => {
            const priority = task.priority;
            if (priority >= 0 && priority < value.length) {
                value[priority] += 1;
            }
            return value;
        }, priorityData);
        
        const priorityDataTotal = Object.values(priorityData).reduce((total, curr) => total + curr, 0);
        
        const priorityDataPercentages = Object.values(priorityData).map((value) => {
            return Math.round((value / priorityDataTotal) * 100);
        });
        
        const priorityDataLabels = Object.keys(priorityData).map((key, index) => {
            return `${getPriority(key).label.toUpperCase()} (${priorityDataPercentages[index]}%)`;
        });
    
        const priorityDatasets = Object.keys(priorityData).map((key, index) => {
            let backgroundColor = '';
            switch(key){
                case '3':
                    backgroundColor = 'rgba(227, 116, 91, 1)';
                    break;
                case '2':
                    backgroundColor = 'rgba(227, 213, 91, 1)';
                    break;
                case '1':
                    backgroundColor = 'rgba(92, 221, 105, 1)';
                    break;
                case '0':
                    backgroundColor = 'rgba(158, 158, 158, 1)';
                    break;
            }
            let dataArray = new Array(Object.keys(priorityData).length).fill(null);
            dataArray[index] = priorityData[key];
            return {
                label: key.substring(0, key.indexOf(':')),
                data: dataArray,
                backgroundColor: backgroundColor
            }
        });
        
        barChartData = {
            labels: priorityDataLabels,
            datasets: priorityDatasets
        };
        
        barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            skipNull: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        color: 'rgba(0, 0, 0, 1)'
                    }
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        color: 'rgba(0, 0, 0, 1)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false,
                        color: 'rgba(0, 0, 0, 1)'
                    }
                }
            }
        };
    }

    return (
        <div className="flex h-full flex-col gap-2 items-center md:items-start justify-center md:justify-start">
            {project && <a href={`/projects/${project.id}`} className="cursor-pointer">
                <div className="text-lg md:text-xl text-basic-blue font-bold hover:underline hover:text-basic-blue/75">
                    {project.projectName.toUpperCase()}
                </div>
            </a>}
            <div className="w-full h-full flex flex-col gap-12 md:gap-24 mb-12">
                {project?.tasks.length === 0 ? (
                    <div className="h-full">
                        <EmptyState
                            message={"Belum ada data tugas yang tersedia."}
                            action={"Buat Tugas Baru Sekarang"}
                            href={`/projects/${project?.id}/board`}
                        />
                    </div>
                ) : project == null ? (
                    <>
                        <EmptyState
                            message={"Belum ada proyek yang dipilih."}
                        />
                    </>
                ) : (
                    <>
                        <div className="h-64 md:h-80 flex flex-col gap-4 md:gap-8">
                            <div className="font-bold text-sm md:text-base">Status Pengerjaan Tugas</div>
                            <Doughnut
                                data={doughnutChartData}
                                options={doughnutChartOptions}
                            />
                        </div>
                        <div className="h-64 md:h-80 flex flex-col gap-4 md:gap-8">
                            <div className="font-bold text-sm md:text-base">Prioritas Tugas</div>
                            <Bar
                                data={barChartData}
                                options={barChartOptions}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}