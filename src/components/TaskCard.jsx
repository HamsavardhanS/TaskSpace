import React from 'react';
import { Clock, CheckCircle, Play } from 'lucide-react';
import clsx from 'clsx';

const TaskCard = ({ task, onEdit, projects }) => {
    const project = projects.find(p => p.id === task.project_id);

    const handleDragStart = (e) => {
        e.dataTransfer.setData('taskId', task.id);
    };

    return (
        <div
            className="bg-white dark:bg-[#1e1e2d] p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/50 mb-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 group"
            draggable
            onDragStart={handleDragStart}
            onClick={() => onEdit(task)}
            style={{
                borderLeftColor: project?.color || '#cbd5e1'
            }}
        >
            <div className="flex justify-between items-start">
                <div className="font-medium text-sm text-slate-700 dark:text-slate-200 leading-snug group-hover:text-primary transition-colors">
                    {task.title}
                </div>
                {task.is_running && (
                    <div className="text-rose-500 animate-pulse">
                        <Play size={14} fill="currentColor" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mt-2">
                {project && (
                    <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[80px]"
                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                        {project.name}
                    </span>
                )}

                {(task.start_time || task.duration) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock size={11} />
                        {task.start_time ? task.start_time.slice(0, 5) : `${task.duration}m`}
                    </div>
                )}

                {task.status === 'done' && (
                    <CheckCircle size={14} className="ml-auto text-emerald-500" />
                )}
            </div>
        </div>
    );
};

export default TaskCard;
