import React, { useMemo } from 'react';
import { useTasks, useProjects, useTimeLogs } from '../hooks/useData';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AnalyticsPage = () => {
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const { timeLogs } = useTimeLogs();

    // 1. Calculate Weekly Activity (Last 7 Days)
    const weeklyData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));

        const createdData = last7Days.map(day =>
            tasks.filter(t => isSameDay(parseISO(t.created_at), day)).length
        );

        const completedData = last7Days.map(day =>
            // Note: Schema doesn't strictly track 'completed_at', relying on updated_at/status or we'd need a new column. 
            // Approximation: tasks done and rescheduled to that day? Or just tasks scheduled for that day that are done?
            // Let's use tasks done that were scheduled for that day as a proxy for efficiency in this mvp.
            tasks.filter(t => t.status === 'done' && t.scheduled_date && isSameDay(parseISO(t.scheduled_date), day)).length
        );

        return {
            labels: last7Days.map(d => format(d, 'EEE')),
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: completedData,
                    borderColor: 'rgb(89, 92, 217)',
                    backgroundColor: 'rgba(89, 92, 217, 0.5)',
                    tension: 0.4
                },
                {
                    label: 'Tasks Created',
                    data: createdData,
                    borderColor: 'rgb(209, 213, 219)',
                    backgroundColor: 'rgba(209, 213, 219, 0.5)',
                    tension: 0.4,
                    borderDash: [5, 5]
                },
            ]
        };
    }, [tasks]);

    // 2. Calculate Workload Distribution (By Project)
    const projectData = useMemo(() => {
        if (!projects.length) return { labels: [], datasets: [] };

        const data = projects.map(p => tasks.filter(t => t.project_id === p.id).length);
        const labels = projects.map(p => p.name);
        const colors = projects.map(p => p.color || '#6366f1');

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        };
    }, [tasks, projects]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Analytics & Insights</h1>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-primary mb-1">{tasks.filter(t => t.status === 'done').length}</div>
                    <div className="text-sm text-slate-500">Total Completed</div>
                </div>
                <div className="glass-panel p-6 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-emerald-500 mb-1">{tasks.filter(t => t.status === 'todo').length}</div>
                    <div className="text-sm text-slate-500">Pending Tasks</div>
                </div>
                <div className="glass-panel p-6 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-amber-500 mb-1">{formatDuration(timeLogs.reduce((acc, curr) => acc + curr.duration, 0))}</div>
                    <div className="text-sm text-slate-500">Total Focus Time</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Weekly Activity</h3>
                    <Line options={options} data={weeklyData} />
                </div>

                <div className="glass-panel p-6 flex flex-col items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 w-full text-left">Workload Distribution</h3>
                    <div className="w-2/3">
                        {tasks.length > 0 ? (
                            <Doughnut data={projectData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                        ) : (
                            <p className="text-slate-400 text-sm text-center py-10">Add tasks to see distribution</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Recent Time Logs</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Task</th>
                                <th className="px-6 py-3">Project</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 rounded-r-lg">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeLogs.length > 0 ? timeLogs.map(log => (
                                <tr key={log.id} className="bg-white dark:bg-transparent border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.tasks?.title || 'Unknown Task'}</td>
                                    <td className="px-6 py-4">
                                        {log.projects ? (
                                            <span
                                                className="px-2 py-1 rounded text-xs font-bold"
                                                style={{ backgroundColor: `${log.projects.color}20`, color: log.projects.color }}
                                            >
                                                {log.projects.name}
                                            </span>
                                        ) : <span className="text-slate-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(log.started_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{formatDuration(log.duration)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No time logs yet. Start the timer on a task to track time!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
