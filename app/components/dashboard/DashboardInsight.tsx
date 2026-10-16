"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import EmptyState from "../common/EmptyState";
import { getPriority, getProgress } from "@/app/lib/string";
import { useEffect, useState } from "react";
import type { DashboardProject } from "../types";
import type { FirestoreTimestampLike } from "@/app/types/domain";

ChartJS.defaults.font.family = "'Inter', sans-serif"
ChartJS.defaults.font.size = 14;
ChartJS.defaults.font.style = 'normal';
ChartJS.defaults.font.weight = 700;
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DashboardInsightProps {
    project: DashboardProject | null
}

function asDate(value: FirestoreTimestampLike | undefined): Date | null {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value === "number") return new Date(value)
    if (typeof value === "string") {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }
    if (typeof value === "object") {
        if ("toDate" in value && typeof value.toDate === "function") return value.toDate()
        if ("seconds" in value) return new Date(value.seconds * 1000)
    }
    return null
}

export default function DashboardInsight({project}: DashboardInsightProps){
    const [position, setPosition] = useState<"right" | "bottom">('right');
    const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null)

    useEffect(() => {
        const timer = window.setTimeout(() => setCurrentTimestamp(Date.now()), 0)
        return () => window.clearTimeout(timer)
    }, [])

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

    let doughnutChartData: ChartData<"doughnut", number[], string> = { labels: [], datasets: [] }
    let doughnutChartOptions: ChartOptions<"doughnut"> = { responsive: true, maintainAspectRatio: false }
    let barChartData: ChartData<"bar", Array<number | null>, string> = { labels: [], datasets: [] }
    let barChartOptions: ChartOptions<"bar"> = { responsive: true, maintainAspectRatio: false }
    if(project != null && project.startStatus != null && project.endStatus != null){
        const projectStartStatus = project.startStatus
        const projectEndStatus = project.endStatus

        const statusData = project.tasks.reduce<Record<"Belum Dimulai" | "Dalam Proses" | "Selesai" | "Terlambat", number>>((value, task) => {
            const currentDate = currentTimestamp ?? 0
            const dueDate = asDate(task.dueDate)
            let dateDifference = 0
            if(dueDate){
                dateDifference = Math.round((dueDate.getTime() - currentDate) / (1000 * 60 * 60 * 24))
            }
            const statusName = task.status?.statusName
            if (!statusName) return value
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

        const statusKeys = Object.keys(statusData) as Array<keyof typeof statusData>
        const statusDataTotal = Object.values(statusData).reduce((total, curr) => total + curr, 0);

        const statusDataPercentages = Object.values(statusData).map((value) => {
            return statusDataTotal === 0 ? 0 : Math.round((value / statusDataTotal) * 100);
        });

        const statusDataLabels = statusKeys.map((key, index) => {
            return `${(getProgress(key)?.label ?? key).toUpperCase()} (${statusDataPercentages[index] ?? 0}%)`;
        });

        const statusDataColors = statusKeys.map((key) => {
            return getProgress(key)?.color ?? "#A9A9A9";
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

        const priorityData = project.tasks.reduce<number[]>((counts, task) => {
            const priority = task.priority
            if (typeof priority === "number" && Number.isInteger(priority) && priority >= 0 && priority < counts.length) {
                counts[priority] += 1;
            }
            return counts;
        }, [0, 0, 0, 0]);

        const priorityDataTotal = Object.values(priorityData).reduce((total, curr) => total + curr, 0);

        const priorityDataPercentages = Object.values(priorityData).map((value) => {
            return priorityDataTotal === 0 ? 0 : Math.round((value / priorityDataTotal) * 100);
        });

        const priorityDataLabels = priorityData.map((_value, index) => {
            return `${(getPriority(index)?.label ?? "Tidak ada").toUpperCase()} (${priorityDataPercentages[index] ?? 0}%)`;
        });

        const priorityColors = [
            'rgba(158, 158, 158, 1)',
            'rgba(92, 221, 105, 1)',
            'rgba(227, 213, 91, 1)',
            'rgba(227, 116, 91, 1)',
        ]
        const priorityDatasets = priorityData.map((count, index) => {
            const dataArray: Array<number | null> = new Array(priorityData.length).fill(null)
            dataArray[index] = count
            return {
                label: String(index),
                data: dataArray,
                backgroundColor: priorityColors[index],
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
