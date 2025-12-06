import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, FileText } from 'lucide-react';
import clsx from 'clsx';

const NotesPage = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    const fetchNotes = async () => {
        const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
        if (!error) {
            setNotes(data || []);
            if (data && data.length > 0 && !activeNote) {
                setActiveNote(data[0]);
            }
        }
        setLoading(false);
    };

    const createNote = async () => {
        const { data, error } = await supabase.from('notes').insert([{
            user_id: user.id,
            title: 'Untitled Note',
            content: ''
        }]).select();

        if (!error && data) {
            setNotes([data[0], ...notes]);
            setActiveNote(data[0]);
        }
    };

    const updateNote = async (id, updates) => {
        setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
        if (activeNote && activeNote.id === id) {
            setActiveNote({ ...activeNote, ...updates });
        }
        await supabase.from('notes').update({ ...updates, updated_at: new Date() }).eq('id', id);
    };

    const deleteNote = async (id) => {
        if (!confirm('Are you sure?')) return;
        await supabase.from('notes').delete().eq('id', id);
        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (activeNote && activeNote.id === id) {
            setActiveNote(newNotes.length > 0 ? newNotes[0] : null);
        }
    };

    return (
        <div className="h-full flex bg-slate-50 dark:bg-black/20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5">
            {/* Notes Sidebar */}
            <div className="w-64 bg-white dark:bg-[#1e1e2d] border-r border-slate-200 dark:border-white/5 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <FileText size={18} className="text-primary" /> All Notes
                    </span>
                    <button onClick={createNote} className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNote(note)}
                            className={clsx(
                                "p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                                activeNote?.id === note.id
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/20"
                                    : "hover:bg-slate-50 dark:hover:bg-white/5"
                            )}
                        >
                            <div className={clsx("font-medium text-sm truncate mb-1", activeNote?.id === note.id ? "text-primary" : "text-slate-700 dark:text-slate-300")}>
                                {note.title || 'Untitled Note'}
                            </div>
                            <div className="text-xs text-slate-400">
                                {new Date(note.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#151521]">
                {activeNote ? (
                    <>
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex gap-4 items-center">
                            <input
                                value={activeNote.title}
                                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                                className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-300"
                                placeholder="Note Title"
                            />
                            <button onClick={() => deleteNote(activeNote.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <textarea
                            value={activeNote.content || ''}
                            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                            className="flex-1 p-8 bg-transparent border-none resize-none outline-none text-base leading-relaxed text-slate-700 dark:text-slate-300 font-sans"
                            placeholder="Start typing your note here..."
                        />
                    </>
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-4">
                        <FileText size={48} className="opacity-20" />
                        <p>Select a note to view or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;
