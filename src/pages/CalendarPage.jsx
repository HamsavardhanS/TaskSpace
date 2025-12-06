import React, { useState } from 'react';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Archive, Calendar as CalIcon, Filter, MapPin } from 'lucide-react';
import { useTasks, useProjects, useEvents } from '../hooks/useData';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import EventModal from '../components/EventModal';
import clsx from 'clsx';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { tasks, addTask, updateTask, deleteTask } = useTasks();
    const { projects } = useProjects();
    const { events } = useEvents(); // New hook

    // Quick Add Task State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [waitingListTitle, setWaitingListTitle] = useState('');
    const [activeDayOffset, setActiveDayOffset] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    // Tasks Logic
    const scheduledTasks = tasks.filter(t => t.scheduled_date);
    const waitingListTasks = tasks.filter(t => !t.scheduled_date && t.status !== 'done');

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, date) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateTask(taskId, { scheduled_date: format(date, 'yyyy-MM-dd') });
        }
    };

    const handleDropToWaitingList = (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateTask(taskId, { scheduled_date: null });
        }
    };

    const handleQuickAdd = async (date) => {
        if (!newTaskTitle.trim()) return;
        await addTask({
            title: newTaskTitle,
            scheduled_date: format(date, 'yyyy-MM-dd'),
            status: 'todo',
            project_id: projects[0]?.id
        });
        setNewTaskTitle('');
        setActiveDayOffset(null);
    };

    const handleAddToWaitingList = async () => {
        if (!waitingListTitle.trim()) return;
        await addTask({
            title: waitingListTitle,
            scheduled_date: null,
            status: 'todo',
            project_id: projects[0]?.id
        });
        setWaitingListTitle('');
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleUpdateTask = async (id, updates) => {
        await updateTask(id, updates);
    };

    const handleDeleteTask = async (id) => {
        await deleteTask(id);
        setIsModalOpen(false);
    };

    const handleAddEventClick = (date) => {
        setSelectedDateForEvent(format(date, 'yyyy-MM-dd'));
        setIsEventModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded shadow-sm text-slate-600 dark:text-slate-300 transition-all"><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Today</button>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded shadow-sm text-slate-600 dark:text-slate-300 transition-all"><ChevronRight size={18} /></button>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CalIcon size={20} className="text-primary-light dark:text-primary" />
                        {format(startDate, 'MMMM yyyy')}
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                    <button onClick={() => handleAddEventClick(new Date())} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-lg">
                        <Plus size={16} /> Event
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden gap-6">
                {/* Main Calendar Area */}
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x">
                    {weekDays.map((date, index) => {
                        const dayTasks = scheduledTasks.filter(t => isSameDay(parseISO(t.scheduled_date), date));
                        const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), date));
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div
                                key={date.toString()}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, date)}
                                className={clsx(
                                    "flex-1 min-w-[200px] flex flex-col rounded-xl p-3 snap-start transition-colors",
                                    isToday ? "bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-200 dark:ring-indigo-500/30" : "bg-slate-50 dark:bg-white/5"
                                )}
                            >
                                <div className="flex justify-between items-center mb-3 px-1 group">
                                    <div>
                                        <span className={clsx("text-sm font-bold block", isToday ? "text-primary" : "text-slate-700 dark:text-slate-300")}>{format(date, 'EEEE')}</span>
                                        <span className={clsx("text-xs font-medium", isToday ? "text-indigo-400" : "text-slate-400")}>{format(date, 'd MMM')}</span>
                                    </div>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setActiveDayOffset(index)}
                                            className="text-slate-400 hover:text-primary p-1 hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
                                            title="Add Task"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                                    {/* Events */}
                                    {dayEvents.map(event => (
                                        <div key={event.id} className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg border-l-4 border-purple-500 text-xs shadow-sm hover:shadow-md transition-shadow cursor-default">
                                            <div className="font-bold text-purple-900 dark:text-purple-100">{event.title}</div>
                                            <div className="text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-1">
                                                <MapPin size={10} /> {event.location || 'No location'}
                                            </div>
                                            <div className="text-purple-600 dark:text-purple-400 mt-0.5">
                                                {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Tasks */}
                                    {dayTasks.map(task => (
                                        <TaskCard key={task.id} task={task} projects={projects} onEdit={handleEditTask} />
                                    ))}

                                    {activeDayOffset === index && (
                                        <div className="p-2">
                                            <input
                                                autoFocus
                                                placeholder="New task..."
                                                value={newTaskTitle}
                                                onChange={e => setNewTaskTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleQuickAdd(date)}
                                                onBlur={() => !newTaskTitle && setActiveDayOffset(null)}
                                                className="w-full bg-white dark:bg-[#1e1e2d] border border-primary rounded-lg px-3 py-2 text-sm focus:outline-none shadow-lg text-slate-800 dark:text-white placeholder-slate-400"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Waiting List Sidebar */}
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropToWaitingList}
                    className="w-72 bg-slate-50/80 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col backdrop-blur-sm"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                            <Archive size={18} className="text-amber-500" />
                            Backlog
                        </div>
                        <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {waitingListTasks.length}
                        </span>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="bg-white dark:bg-[#1e1e2d] px-3 py-2 rounded-lg shadow-sm mb-3 border border-transparent focus-within:border-primary transition-all">
                            <input
                                placeholder="+ Add to backlog"
                                value={waitingListTitle}
                                onChange={e => setWaitingListTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddToWaitingList()}
                                className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                            />
                        </div>

                        {waitingListTasks.map(task => (
                            <TaskCard key={task.id} task={task} projects={projects} onEdit={handleEditTask} />
                        ))}
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                date={selectedDateForEvent}
            />
        </div>
    );
};

export default CalendarPage;
