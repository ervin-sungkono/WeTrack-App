"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const doughnutChartData = {
    labels: ['Belum Dimulai', 'Dalam Proses', 'Selesai', 'Terlambat'],
    datasets: [
        {
            // label: 'Persentase',
            data: [0, 28, 60, 12],
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
            title: {
                display: true,
                text: 'Status Tugas',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            position: 'right',
        },
    },
};

export const barChartData = {
    labels: ['Rendah', 'Sedang', 'Tinggi'],
    datasets: [
        {
            label: 'Rendah',
            data: [10, null, null],
            backgroundColor: 'rgba(92, 221, 105, 1)',
        },
        {
            label: 'Sedang',
            data: [null, 15, null],
            backgroundColor: 'rgba(227, 213, 91, 1)',
        },
        {
            label: 'Tinggi',
            data: [null, null, 5],
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
            title: {
                display: true,
                text: 'Prioritas Tugas',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            position: 'top',
        },
    },
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            grid: {
                display: false
            }
        }
    }
};

export default function DashboardInsight(){
    return (
        <div className="flex flex-col gap-1 md:gap-2 items-center md:items-start justify-center md:justify-start">
            <div className="text-md md:text-lg font-bold">
                Ringkasan Tugas Saya
            </div>
            <div className="text-sm md:text-md">
                Nama Proyek
            </div>
            <div className="flex flex-col gap-8 mt-4">
                <div>
                    <Doughnut
                        data={doughnutChartData}
                        options={doughnutChartOptions}
                    />
                </div>
                <div>
                    <Bar
                        data={barChartData}
                        options={barChartOptions}
                    />
                </div>
            </div>
        </div>
    )
}