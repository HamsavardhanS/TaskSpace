import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks, useTimeLogs } from '../hooks/useData';
import { format, isSameDay, subDays, parseISO } from 'date-fns';
import { CheckCircle, Clock, Zap, TrendingUp, Calendar as CalIcon } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { user } = useAuth();
    const { tasks } = useTasks();
    const { timeLogs } = useTimeLogs();

    // 1. Stats Calculation
    const today = new Date();
    const todaysTasks = tasks.filter(t => t.scheduled_date && isSameDay(parseISO(t.scheduled_date), today));
    const completedToday = todaysTasks.filter(t => t.status === 'done').length;

    const todaysFocusSeconds = timeLogs
        .filter(log => isSameDay(parseISO(log.started_at), today))
        .reduce((acc, curr) => acc + curr.duration, 0);

    const focusHours = Math.floor(todaysFocusSeconds / 3600);
    const focusMinutes = Math.floor((todaysFocusSeconds % 3600) / 60);

    // Productivity Score (Arbitrary logic: 10% per task, 20% per hour focused)
    const productivityScore = Math.min(100, (completedToday * 10) + (focusHours * 20));

    // Streak Logic ( Consecutive days with at least 1 completed task or time log )
    // Simplified for MVP: Just count unique days in time logs in last 30 days
    const streak = new Set(timeLogs.map(l => l.started_at.split('T')[0])).size;

    // 2. Chart Data (Focus Time Last 7 Days)
    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
        const data = last7Days.map(day => {
            const seconds = timeLogs
                .filter(log => isSameDay(parseISO(log.started_at), day))
                .reduce((acc, curr) => acc + curr.duration, 0);
            return (seconds / 3600).toFixed(1); // Hours
        });

        return {
            labels: last7Days.map(d => format(d, 'EEE')),
            datasets: [
                {
                    label: 'Focus Hours',
                    data: data,
                    backgroundColor: '#595cd9',
                    borderRadius: 4,
                },
            ],
        };
    }, [timeLogs]);


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: { display: false }
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.email?.split('@')[0]} 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Here's what's happening in your workspace today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tasks Today"
                    value={`${completedToday}/${todaysTasks.length}`}
                    sub="Tasks completed"
                    icon={CheckCircle}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Focus Time"
                    value={`${focusHours}h ${focusMinutes}m`}
                    sub="Recorded today"
                    icon={Clock}
                    color="text-primary"
                    bg="bg-primary/10"
                />
                <StatCard
                    title="Productivity"
                    value={`${productivityScore}%`}
                    sub="Daily Score"
                    icon={Zap}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="Activity"
                    value={`${streak} Days`}
                    sub="Active usage"
                    icon={TrendingUp}
                    color="text-rose-500"
                    bg="bg-rose-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <CalIcon size={20} className="text-primary" />
                            Today's Priorities
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {todaysTasks.length > 0 ? (
                            todaysTasks.map(task => (
                                <div key={task.id} className="transform transition-all hover:scale-[1.01]">
                                    <TaskCard task={task} projects={[]} onEdit={() => { }} />
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <p className="text-slate-500">No tasks scheduled for today. adding some from backlog?</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Charts or Activity */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Focus Trends</h3>
                        <div className="h-48">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, sub, icon: Icon, color, bg }) => (
    <div className="glass-panel p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        <div>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{sub}</p>
        </div>
    </div>
);

export default Dashboard;
