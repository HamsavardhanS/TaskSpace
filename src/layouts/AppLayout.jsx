import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects, useTasks } from '../hooks/useData';
import {
    Calendar, Layout, FileText, FolderPlus, LogOut,
    Home, PieChart, Settings, Sun, Moon, Plus, Target
} from 'lucide-react';
import clsx from 'clsx';

const AppLayout = () => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { projects, addProject } = useProjects();
    const [darkMode, setDarkMode] = useState(false);

    // Initial Dark Mode Check
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    }

    const handleAddProject = async () => {
        const name = prompt("Enter project name:");
        if (name) {
            await addProject(name);
        }
    }

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/board', icon: Layout, label: 'My Tasks' },
        { path: '/analytics', icon: PieChart, label: 'Analytics' },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const { tasks } = useTasks();

    // Search Logic
    const searchResults = searchQuery ? [
        ...tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ ...t, type: 'Task', path: '/board' })),
        ...projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => ({ ...p, type: 'Project', title: p.name, path: `/project/${p.id}` }))
    ] : [];

    // ... (rest of existing code)

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-surface-darker text-slate-800 dark:text-gray-100 font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 p-4 flex flex-col gap-6 ">
                <div className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                        T
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">TaskSpace</span>
                </div>

                {/* Search Bar */}
                <div className="px-1 relative">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {/* Search Results Dropdown */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-2 flex flex-col gap-1">
                            {searchResults.length > 0 ? searchResults.map((res, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        navigate(res.path);
                                        setSearchQuery('');
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg group"
                                >
                                    <div className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", res.type === 'Project' ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700")}>
                                        {res.type}
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{res.title}</span>
                                </button>
                            )) : (
                                <div className="p-3 text-center text-xs text-slate-400">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => clsx("nav-item", isActive && "active")}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="mt-6 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Projects
                    </div>

                    <div className="space-y-1">
                        {projects.map(project => (
                            <NavLink
                                key={project.id}
                                to={`/project/${project.id}`} // Future Project Page
                                className={({ isActive }) => clsx(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive ? "bg-white/50 dark:bg-white/5 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10 dark:ring-black/10" style={{ backgroundColor: project.color }}></div>
                                <span className="truncate">{project.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    <button
                        onClick={handleAddProject}
                        className="mt-2 flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-primary transition-colors hover:bg-indigo-50 dark:hover:bg-white/5 rounded-lg w-full text-left"
                    >
                        <Plus size={18} />
                        <span>Add Project</span>
                    </button>

                    <NavLink
                        to="/notes"
                        className={({ isActive }) => clsx("nav-item mt-4", isActive && "active")}
                    >
                        <FileText size={20} />
                        <span>Notes</span>
                    </NavLink>
                </nav>

                <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#151521] m-4 rounded-2xl shadow-neumorph dark:shadow-neumorph-dark border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex-1 overflow-auto p-8 relative z-10 scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
