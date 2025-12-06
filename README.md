# TaskSpace 🚀

**TaskSpace** (formerly TaskSphere/Bordio Clone) is a comprehensive, modern productivity application designed to help you organize your life and work. Built with **React**, **Tailwind CSS**, and **Supabase**, it offers a premium, glassmorphic interface with real-time synchronization.

## ✨ Key Features

- **📊 Dashboard Overview**: Visualize your daily progress, productivity streaks, and focus metrics at a glance.
- **📅 Interactive Calendar**: Weekly planner with drag-and-drop task scheduling and event management.
- **🧘 Focus Mode**: A dedicated, distraction-free Pomodoro-style timer to help you stay in the zone.
- **⚡ Global Search**: Instantly find tasks, projects, and notes with the "Command Palette" style search.
- **📈 Real-Time Analytics**: Track your work habits with dynamic charts powered by actual usage data.
- **🎨 Glassmorphic UI**: A stunning, modern interface with full **Dark Mode** support.
- **⚡ Real-Time Sync**: Collaboration-ready with instant updates across devices using Supabase Realtime.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (v3), PostCSS, Framer Motion (Transitional)
- **Backend Base**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: Supabase DB with Row Level Security (RLS)
- **Charts**: Chart.js, React-Chartjs-2
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A generic [Supabase](https://supabase.com) Account (Free Tier is fine)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/HamsavardhanS/TaskSpace.git
    cd taskspace
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Migration (Crucial!)**
    - Go to your Supabase Project Dashboard -> **SQL Editor**.
    - Run the script found in `update_schema.sql` to create the tables.
    - Run `fix_rls.sql` to apply critical security patches.

5.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to view it in your browser.

## 📦 Deployment

This app is optimized for deployment on **Vercel**.
