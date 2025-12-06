import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Helper to subscribe to realtime changes
const useSubscription = (tableName, callback, filters = {}) => {
    useEffect(() => {
        const channel = supabase
            .channel(`${tableName}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName, ...filters }, callback)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, JSON.stringify(filters)]);
};

export const useTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching tasks:', error);
        else setTasks(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    // Realtime Subscription
    useSubscription('tasks', () => fetchTasks(), { filter: user ? `user_id=eq.${user.id}` : undefined });

    const addTask = async (task) => {
        const { data, error } = await supabase.from('tasks').insert([{ ...task, user_id: user.id }]).select();
        if (error) {
            console.error("Error adding task:", error);
            return null;
        }
        return data[0];
    };

    const updateTask = async (id, updates) => {
        const { error } = await supabase.from('tasks').update(updates).eq('id', id);
        if (error) console.error("Error updating task:", error);
    };

    const deleteTask = async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error("Error deleting task:", error);
    }

    const toggleTimer = async (task) => {
        const now = new Date().toISOString();
        if (task.is_running) {
            const startTime = new Date(task.last_started_at).getTime();
            const endTime = new Date().getTime();
            const sessionSeconds = Math.floor((endTime - startTime) / 1000);

            // Log time to analytics (new!)
            if (sessionSeconds > 0) {
                await supabase.from('time_logs').insert([{
                    task_id: task.id,
                    user_id: user.id,
                    project_id: task.project_id,
                    duration: sessionSeconds,
                    started_at: task.last_started_at
                }]);
            }

            await updateTask(task.id, {
                is_running: false,
                time_spent: (task.time_spent || 0) + sessionSeconds,
                last_started_at: null
            });
        } else {
            await updateTask(task.id, {
                is_running: true,
                last_started_at: now
            });
        }
    };

    return { tasks, loading, addTask, updateTask, deleteTask, toggleTimer };
};

export const useProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('projects').select('*').order('created_at');
        if (!error) setProjects(data || []);
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    // Realtime changes for projects
    useSubscription('projects', () => fetchProjects());
    // Note: Projects might be shared in future, for now filtering by RLS is enough on fetch, 
    // but subscribe filter is tricky without user_id column on all tables. 
    // For simplicity, we refetch on any public change to 'projects' table, 
    // but in prod you'd want `user_id=eq.${user.id}` or specific project IDs.

    const addProject = async (name, color = '#6366f1') => {
        const { data, error } = await supabase.from('projects').insert([{ name, color, owner_id: user.id, user_id: user.id }]).select();
        // Added owner_id for future proofing
    }
    return { projects, addProject };
};

export const useSubtasks = (taskId) => {
    const { user } = useAuth();
    const [subtasks, setSubtasks] = useState([]);

    const fetchSubtasks = async () => {
        if (!user || !taskId) return;
        const { data } = await supabase.from('subtasks').select('*').eq('task_id', taskId).order('created_at');
        setSubtasks(data || []);
    };

    useEffect(() => {
        fetchSubtasks();
    }, [user, taskId]);

    useSubscription('subtasks', () => fetchSubtasks(), { filter: `task_id=eq.${taskId}` });

    const addSubtask = async (title) => {
        await supabase.from('subtasks').insert([{ task_id: taskId, user_id: user.id, title }]).select();
    };

    const toggleSubtask = async (id, completed) => {
        await supabase.from('subtasks').update({ completed }).eq('id', id);
    };

    const deleteSubtask = async (id) => {
        await supabase.from('subtasks').delete().eq('id', id);
    }

    return { subtasks, addSubtask, toggleSubtask, deleteSubtask };
};

export const useComments = (taskId) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        if (!user || !taskId) return;
        const { data } = await supabase.from('comments').select('*, profiles(email)').eq('task_id', taskId).order('created_at');
        setComments(data || []);
    };

    useEffect(() => {
        fetchComments();
    }, [user, taskId]);

    useSubscription('comments', () => fetchComments(), { filter: `task_id=eq.${taskId}` });

    const addComment = async (content) => {
        await supabase.from('comments').insert([{ task_id: taskId, user_id: user.id, content }]).select();
    };

    return { comments, addComment };
};

export const useEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        if (!user) return;
        const { data } = await supabase.from('events').select('*').order('start_time');
        setEvents(data || []);
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    useSubscription('events', () => fetchEvents(), { filter: `user_id=eq.${user.id}` });

    const addEvent = async (event) => {
        const { data, error } = await supabase.from('events').insert([{ ...event, user_id: user.id }]).select();
        return { data, error };
    };

    return { events, addEvent };
};

export const useTimeLogs = () => {
    const { user } = useAuth();
    const [timeLogs, setTimeLogs] = useState([]);

    const fetchTimeLogs = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('time_logs')
            .select(`
                *,
                tasks (title),
                projects (name, color)
            `)
            .order('created_at', { ascending: false })
            .limit(50); // Limit to recent logs

        if (data) setTimeLogs(data);
    };

    useEffect(() => {
        fetchTimeLogs();
    }, [user]);

    useSubscription('time_logs', () => fetchTimeLogs(), { filter: user ? `user_id=eq.${user.id}` : undefined });

    return { timeLogs };
};
