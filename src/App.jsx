import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import BoardPage from './pages/BoardPage';
import NotesPage from './pages/NotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProjectPage from './pages/ProjectPage';
import FocusPage from './pages/FocusPage';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/auth" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="board" element={<BoardPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="project/:id" element={<ProjectPage />} />
                        <Route path="notes" element={<NotesPage />} />
                    </Route>
                    <Route path="/focus" element={
                        <ProtectedRoute>
                            <FocusPage />
                        </ProtectedRoute>
                    } />

                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
