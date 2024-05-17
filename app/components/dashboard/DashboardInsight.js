"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import EmptyState from "../common/EmptyState";
import { generateColors } from "@/app/lib/color";
import { getPriority } from "@/app/lib/string";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardInsight({project}){
    let doughnutChartData, doughnutChartOptions, barChartData, barChartOptions;
    if(project !== null){
        const statusData = project?.tasks.reduce((value, task) => {
            const statusName = task.status.statusName;
            if(value[statusName]){
                value[statusName] += 1;
            }else {
                value[statusName] = 1;
            }
            return value;
        }, {});
    
        const statusDataTotal = Object.values(statusData).reduce((total, curr) => total + curr, 0);
        
        const statusDataPercentages = Object.values(statusData).map((value) => {
            return Math.round((value / statusDataTotal) * 100);
        });
        
        const statusDataLabels = Object.keys(statusData).map((key, index) => {
            return `${key.toUpperCase()} (${statusDataPercentages[index]}%)`;
        });

        const statusDataColors = generateColors(Object.keys(statusData).length)
        
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
                    position: 'right',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
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
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
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
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: 'rgba(0, 0, 0, 1)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
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
                ) : project === null ? (
                    <>
                        <EmptyState
                            message={"Belum ada proyek yang dipilih."}
                        />
                    </>
                ) : (
                    <>
                        <div className="h-64 md:h-80 flex flex-col gap-4 md:gap-8">
                            <div className="font-bold text-sm md:text-base">Status Tugas</div>
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