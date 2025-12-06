import React, { useState } from 'react';
import { X, MapPin, Users, Calendar, Save } from 'lucide-react';
import { useEvents, useProjects } from '../hooks/useData';

const EventModal = ({ isOpen, onClose, date }) => {
    const { addEvent } = useEvents();
    const { projects } = useProjects();

    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [startTime, setStartTime] = useState(date ? `${date}T09:00` : '');
    const [endTime, setEndTime] = useState(date ? `${date}T10:00` : '');
    const [location, setLocation] = useState('');
    const [participants, setParticipants] = useState('');

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title || !startTime || !endTime) return;

        await addEvent({
            title,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            location,
            related_project: projectId || null,
            participants: participants.split(',').map(p => p.trim()).filter(Boolean)
        });
        onClose();
        // Reset form
        setTitle('');
        setLocation('');
        setParticipants('');
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1e1e2d] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Schedule Event</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Event Title"
                        className="w-full text-xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 border-b border-slate-200 focus:border-primary pb-2"
                        autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Start</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">End</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-slate-400" />
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Add location"
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-sm focus:border-primary outline-none dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-slate-400" />
                        <input
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            placeholder="Add participants (comma separated)"
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-2 text-sm focus:border-primary outline-none dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Project</label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                        >
                            <option value="">No Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Save Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
