"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const statusDataDummy = {
    'Belum Dimulai': 3,
    'Dalam Proses': 20,
    'Selesai': 10,
    'Terlambat': 2,
}

const statusDataTotal = Object.values(statusDataDummy).reduce((total, curr) => total + curr, 0);

const statusDataPercentages = Object.values(statusDataDummy).map((value) => {
    return Math.round((value / statusDataTotal) * 100);
});

const statusDataLabels = Object.keys(statusDataDummy).map((key, index) => {
    return `${key} (${statusDataPercentages[index]}%)`;
});

export const doughnutChartData = {
    labels: statusDataLabels,
    datasets: [
        {
            data: Object.values(statusDataDummy),
            backgroundColor: [
                'rgba(158, 158, 158, 1)',
                'rgba(227, 213, 91, 1)',
                'rgba(92, 221, 105, 1)',
                'rgba(227, 116, 91, 1)',
            ],
            borderColor: [
                'rgba(158, 158, 158, 1)',
                'rgba(227, 213, 91, 1)',
                'rgba(92, 221, 105, 1)',
                'rgba(227, 116, 91, 1)',
            ],
            borderWidth: 1,
        },
    ],
};

export const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
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
};

const priorityDataDummy = {
    'Tidak Ada': 2,
    'Rendah': 4,
    'Sedang': 8,
    'Tinggi': 1,
}

const priorityDataNumbers = Object.values(priorityDataDummy);

const priorityDataTotal = Object.values(priorityDataDummy).reduce((total, curr) => total + curr, 0);

const priorityDataPercentages = Object.values(priorityDataDummy).map((value) => {
    return Math.round((value / priorityDataTotal) * 100);
});

const priorityDataLabels = Object.keys(priorityDataDummy).map((key, index) => {
    return `${key} (${priorityDataPercentages[index]}%)`;
});

export const barChartData = {
    labels: priorityDataLabels,
    datasets: [
        {
            label: priorityDataLabels[0].substring(0, priorityDataLabels[0].indexOf(':')),
            data: [priorityDataNumbers[0], null, null, null],
            backgroundColor: 'rgba(158, 158, 158, 1)',
        },
        {
            label: priorityDataLabels[1].substring(0, priorityDataLabels[1].indexOf(':')),
            data: [null, priorityDataNumbers[1], null, null],
            backgroundColor: 'rgba(92, 221, 105, 1)',
        },
        {
            label: priorityDataLabels[2].substring(0, priorityDataLabels[2].indexOf(':')),
            data: [null, null, priorityDataNumbers[2], null],
            backgroundColor: 'rgba(227, 213, 91, 1)',
        },
        {
            label: priorityDataLabels[3].substring(0, priorityDataLabels[3].indexOf(':')),
            data: [null, null, null, priorityDataNumbers[3]],
            backgroundColor: 'rgba(227, 116, 91, 1)',
        },
    ],
};

export const barChartOptions = {
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

export default function DashboardInsight({project}){
    return (
        <div className="flex flex-col gap-1 md:gap-2 items-center md:items-start justify-center md:justify-start">
            <div className="text-lg md:text-xl font-bold">
                Ringkasan Tugas Saya
            </div>
            <a href={`/projects/${project?.id}`} className="cursor-pointer">
                <div className="text-sm md:text-base text-basic-blue font-bold">
                    {project?.projectName}
                </div>
            </a>
            <div className="w-full flex flex-col gap-12 md:gap-24 mb-12">
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
            </div>
        </div>
    )
}