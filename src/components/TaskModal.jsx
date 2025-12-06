import React, { useState, useEffect } from 'react';
import { X, Clock, Trash2, Save, Play, Square, CheckSquare, MessageSquare, ListChecks } from 'lucide-react';
import { useProjects, useSubtasks, useComments, useTasks } from '../hooks/useData';
import clsx from 'clsx';

const TaskModal = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
    const { projects } = useProjects();
    const { toggleTimer } = useTasks();
    const [activeTab, setActiveTab] = useState('details');

    // Details State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('todo');
    const [projectId, setProjectId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'todo');
            setProjectId(task.project_id || '');
            setScheduledDate(task.scheduled_date || '');
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        onUpdate(task.id, {
            title,
            description,
            status,
            project_id: projectId,
            scheduled_date: scheduledDate
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Delete this task?')) {
            onDelete(task.id);
            onClose();
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1e1e2d] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>

                        {/* Timer Control */}
                        <div className="flex items-center gap-2 text-xs font-mono bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg">
                            {formatTime(task.time_spent || 0)}
                            <button
                                onClick={() => toggleTimer(task)}
                                className={clsx("transition-colors", task.is_running ? "text-rose-500 hover:text-rose-600" : "text-emerald-500 hover:text-emerald-600")}
                            >
                                {task.is_running ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-slate-100 dark:border-white/5">
                    {['details', 'subtasks', 'comments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-all capitalize",
                                activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Task title"
                                className="w-full text-xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400"
                            />

                            <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="w-20 text-sm font-medium text-slate-500 dark:text-slate-400">Project</span>
                                    <select
                                        value={projectId}
                                        onChange={(e) => setProjectId(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary"
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="w-20 text-sm font-medium text-slate-500 dark:text-slate-400">Date</span>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Description</div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add more details..."
                                        className="w-full min-h-[120px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary resize-y"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subtasks' && <SubtasksTab taskId={task.id} />}
                    {activeTab === 'comments' && <CommentsTab taskId={task.id} />}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="glass-button flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const SubtasksTab = ({ taskId }) => {
    const { subtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks(taskId);
    const [newSubtask, setNewSubtask] = useState('');

    const handleAdd = async (e) => {
        if (e.key === 'Enter' && newSubtask.trim()) {
            await addSubtask(newSubtask);
            setNewSubtask('');
        }
    }

    return (
        <div className="space-y-4">
            <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={handleAdd}
                placeholder="Add a subtask..."
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />

            <div className="space-y-1">
                {subtasks.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg group transition-colors">
                        <button onClick={() => toggleSubtask(s.id, !s.completed)} className={clsx("transition-colors", s.completed ? "text-primary" : "text-slate-300 dark:text-slate-600 hover:text-primary")}>
                            {s.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <span className={clsx("flex-1 text-sm transition-all", s.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200")}>
                            {s.title}
                        </span>
                        <button onClick={() => deleteSubtask(s.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

const CommentsTab = ({ taskId }) => {
    const { comments, addComment } = useComments(taskId);
    const [newComment, setNewComment] = useState('');

    const handleSend = async () => {
        if (!newComment.trim()) return;
        await addComment(newComment);
        setNewComment('');
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {comments.map(c => (
                    <div key={c.id} className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-primary">{c.profiles?.email?.split('@')[0] || 'User'}</span>
                            <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{c.content}</div>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-center text-slate-400 text-sm mt-4">No comments yet.</p>}
            </div>

            <div className="flex gap-2">
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button
                    onClick={handleSend}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default TaskModal;
