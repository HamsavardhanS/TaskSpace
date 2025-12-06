import React, { useState } from 'react';
import { useTasks, useProjects } from '../hooks/useData';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Columns, Kanban } from 'lucide-react';

const BoardPage = () => {
    const { tasks, updateTask, deleteTask } = useTasks();
    const { projects } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-slate-200 dark:bg-slate-700' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-400' },
        { id: 'done', title: 'Done', color: 'bg-emerald-400' }
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            updateTask(taskId, { status });
        }
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

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <Kanban className="text-primary" size={24} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Project Board</h2>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id);

                    return (
                        <div
                            key={col.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className="flex-1 min-w-[280px] max-w-sm bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{col.title}</span>
                                </div>
                                <span className="bg-white dark:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {colTasks.length}
                                </span>
                            </div>

                            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                                {colTasks.map(task => (
                                    <TaskCard key={task.id} task={task} projects={projects} onEdit={handleEditTask} />
                                ))}
                                {colTasks.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default BoardPage;
