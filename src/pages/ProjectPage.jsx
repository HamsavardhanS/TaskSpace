import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTasks, useProjects } from '../hooks/useData';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Layout, Plus } from 'lucide-react';

const ProjectPage = () => {
    const { id } = useParams();
    const { tasks, updateTask, deleteTask, addTask } = useTasks();
    const { projects } = useProjects();

    // Find current project
    const project = projects.find(p => p.id === id);

    // Filter tasks
    const projectTasks = tasks.filter(t => t.project_id === id);

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

    const handleUpdateTask = async (taskId, updates) => {
        await updateTask(taskId, updates);
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
        setIsModalOpen(false);
    };

    const handleAddTask = async () => {
        const title = prompt("New Task Title:");
        if (title) {
            await addTask({
                title,
                status: 'todo',
                project_id: id,
                // Default to today if needed, or backlog (null)
                scheduled_date: new Date().toISOString().split('T')[0]
            });
        }
    };

    if (!project) return <div className="p-8 text-slate-500">Project loading or not found...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{project.name}</h2>
                </div>
                <button onClick={handleAddTask} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                    <Plus size={16} /> Add Task
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => {
                    const colTasks = projectTasks.filter(t => t.status === col.id);

                    return (
                        <div
                            key={col.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className="flex-1 min-w-[280px] max-w-sm bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{col.title}</span>
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
                                        Empty
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

export default ProjectPage;
