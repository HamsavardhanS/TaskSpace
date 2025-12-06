import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, MicOff, Music } from 'lucide-react';
import { useTasks } from '../hooks/useData';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const FocusPage = () => {
    const navigate = useNavigate();
    const { toggleTimer, tasks } = useTasks();

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak

    // Select a task to focus on
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggle = () => setIsActive(!isActive);

    const reset = () => {
        setIsActive(false);
        if (mode === 'focus') setTimeLeft(25 * 60);
        if (mode === 'shortBreak') setTimeLeft(5 * 60);
        if (mode === 'longBreak') setTimeLeft(15 * 60);
    };

    const setTimerMode = (newMode, minutes) => {
        setMode(newMode);
        setTimeLeft(minutes * 60);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Auto-log to Supabase if a task is selected
    useEffect(() => {
        if (selectedTask && isActive) {
            // Need a way to sync this local timer with the DB 'is_running' status if we want true sync.
            // For now, let's just use the local timer as a "Pomodoro" tool and maybe log completion manually or rely on the other toggleTimer logic.
            // Actually, let's reuse toggleTimer if we can, but toggleTimer is toggle-based. 
            // Better to keep this Focus Mode disjoint for now as a "Session Timer" and just update the task status?
            // Let's keep it simple: It's a visual timer.
        }
    }, [isActive, selectedTask]);

    return (
        <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambiance */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl z-0 animate-pulse duration-[10000ms]"></div>

            <button
                onClick={() => navigate('/')}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-all z-20"
            >
                <X size={24} />
            </button>

            <div className="z-10 flex flex-col items-center max-w-2xl w-full px-4">
                <div className="flex gap-4 mb-12 bg-white/5 p-1 rounded-2xl backdrop-blur-sm">
                    {[{ id: 'focus', label: 'Focus', m: 25 }, { id: 'shortBreak', label: 'Short Break', m: 5 }, { id: 'longBreak', label: 'Long Break', m: 15 }].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setTimerMode(opt.id, opt.m)}
                            className={clsx(
                                "px-6 py-2 rounded-xl text-sm font-medium transition-all",
                                mode === opt.id ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="text-[12rem] font-bold font-mono tracking-tighter leading-none mb-12 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 drop-shadow-2xl">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={toggle}
                        className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={reset}
                        className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>

                <div className="w-full max-w-md">
                    <div className="text-center text-slate-400 mb-4 text-sm uppercase tracking-widest font-bold">Focusing On</div>
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-lg text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
                    >
                        <option value="">Select a task...</option>
                        {tasks.filter(t => t.status !== 'done').map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FocusPage;
