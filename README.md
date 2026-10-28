# DayTrack — Personal Productivity & Life Management App

A modern, mobile-first personal productivity and growth web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, Lucide icons, and Recharts.

Designed specifically for ambitious working professionals balancing a demanding full-time job (10 AM to 7 PM) with technical study (DSA, Java, MERN), government exam preparation (SSC CGL), gym & fitness routines, healthy meal planning, groceries, room chores, and tomorrow planning.

---

## 🌟 Key Features

### 1. Daily Dashboard
- **Instant Answers to the 3 Core Questions:**
  1. *What do I need to do today?*
  2. *What have I completed?*
  3. *What still needs to be done?*
- **Visual Progress Ring:** Animated circular progress indicator showing completed/total tasks and daily completion percentage.
- **Personalized Greeting & Motivation:** Time-of-day greeting with rotating inspiring productivity quotes.
- **Daily Routine Blueprint:** Visual schedule timeline tailored to your 10 AM – 7 PM job + morning momentum + evening study blocks.
- **Priority Tasks Widget:** High-priority items highlighted for quick focus.

### 2. Rapid Task Capture & Quick Add
- **Floating Action Button (FAB):** Persistent mobile floating button for instant task addition in seconds.
- **Fast Input Flow:** Auto-focused title input with quick-date chips (`Today`, `Tomorrow`, `Custom`).
- **Category & Priority Selectors:** Visual pills with custom color coding and icon badges.
- **One-Click Routine Presets:** Quick template chips (*Study Java 45m*, *Solve 3 DSA*, *Revise SSC Quant*, *Gym*, *Buy eggs & bananas*, *Prepare clothes & bag*).
- **Expandable Advanced Fields:** Optional scheduled time, estimated duration, and notes.

### 3. Today, Tomorrow & Upcoming Planning
- **Dedicated Views:** `Today`, `Tomorrow`, `Upcoming`, and `All Tasks` with instant category and search filtering.
- **One-Tap Rescheduling:** Seamlessly move any pending task from today to tomorrow without recreating it.
- **Overdue Task Rollover:** Clearly surfaces unfinished tasks from past days with a 1-tap `Move all to Today` action.
- **Dedicated "Plan Tomorrow" Modal:** Batch-create tomorrow's agenda and rollover leftover tasks before going to bed.

### 4. Recurring Tasks & Habits Tracker
- **Distinct Habit Tracking:** Clear separation between one-off checklist tasks and daily recurring habits.
- **Streaks & Longest Streak Counters:** Real-time calculation of current consistency and personal records.
- **Consistency Heatmap:** 60-day GitHub-style visual grid representing daily discipline and habit check-ins.

### 5. Focused Study Session Tracker
- **Subject-Specific Stopwatch Timer:** Start, pause, resume, reset, and log focus blocks with 1 tap.
- **Preset Study Tracks:**
  - *Technical Career:* DSA, Core Java, MERN Stack, SQL & DBMS, Technical Interview Prep.
  - *Government Exam:* SSC CGL Quantitative Aptitude, Reasoning, English, General Awareness.
  - *Custom Subject:* Create any topic on the fly.
- **Daily & Weekly Totals:** Honest recorded study time separate from estimated task durations.

### 6. End-of-Day Review & Reflection
- **Calm, Non-Judgmental Screen:** Review today's achievements without guilt.
- **Live Summary:** Tasks completed, pending backlog, recorded study hours, and habits finished.
- **Guided Reflection:**
  - *"What went well today?"*
  - *"One thing to improve tomorrow"*
- **Actionable Tomorrow Plan:** Checkbox rollover of pending items directly into tomorrow's list.
- **Historical Daily Logs:** Retrospective archive to track long-term growth.

### 7. Progress & Growth Analytics
- **Summary Metrics:** Total tasks completed, overall completion %, study hours, gym consistency count.
- **Study Effort Distribution:** Recharts comparison of Technical vs Government study time over the last 7 days.
- **Life Domain Balance Donut:** Breakdown of completed tasks across all life categories.
- **Productivity Heatmap Matrix:** Intensity matrix combining completed tasks, study blocks, and habits.
- **Date Range Filters:** 7 Days, 30 Days, and 90 Days views.

### 8. Mobile-First Experience, PWA & Dark Mode
- **Mobile Bottom Navigation Bar:** Clean, fixed touch navigation for mobile phones.
- **Desktop Sidebar Navigation:** Collapsible desktop layout with workspace statistics.
- **Dark Mode Support:** Light and Dark theme with persistent localStorage state.
- **Installable PWA:** Web App Manifest and Service Worker caching for standalone homescreen app installation on iOS & Android.
- **Offline Sync Resilience:** Offline task queue that caches creations and syncs with MongoDB once internet reconnects.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose, JWT (jsonwebtoken), bcryptjs, CORS, Dotenv |
| **Database** | MongoDB (Local / Atlas) |
| **PWA** | Web App Manifest (`manifest.json`), Service Worker (`sw.js`) |

---

## 📁 Project Architecture & Folder Structure

```
TaskTracker/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js               # Auth & profile
│   │   │   ├── Task.js               # Tasks, priorities, scheduledDate
│   │   │   ├── Category.js           # 8 default + custom categories
│   │   │   ├── Habit.js              # Habit definitions & streak tracking
│   │   │   ├── HabitCompletion.js   # Daily completion records
│   │   │   ├── StudySession.js       # Subject-based timer session logs
│   │   │   └── DailyReview.js        # End-of-day reviews & reflections
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification & req.user injection
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth (register, login, me, profile)
│   │   │   ├── categoryRoutes.js     # /api/categories
│   │   │   ├── taskRoutes.js         # /api/tasks (CRUD, toggle, reschedule, batch-plan)
│   │   │   ├── habitRoutes.js        # /api/habits (CRUD, toggle-date, heatmap)
│   │   │   ├── studyRoutes.js        # /api/study (sessions, stats)
│   │   │   ├── reviewRoutes.js       # /api/reviews (today-summary, submit, history)
│   │   │   └── analyticsRoutes.js    # /api/analytics/overview
│   │   ├── utils/
│   │   │   └── defaultCategories.js  # 8 Pre-configured life domain seeders
│   │   └── server.js                 # Express server entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── public/
│   │   ├── favicon.svg               # App icon
│   │   ├── manifest.json             # PWA Web App Manifest
│   │   └── sw.js                     # Service worker caching
│   ├── src/
│   │   ├── api/                      # Axios API clients
│   │   ├── components/
│   │   │   ├── common/               # IconHelper
│   │   │   ├── layout/               # AppLayout, MobileBottomNav, DesktopSidebar, Header
│   │   │   ├── dashboard/            # ProgressRing, RoutineTimeline, MotivationCard, PriorityTasksWidget
│   │   │   ├── tasks/                # TaskCard, TaskQuickAddModal, PlanTomorrowModal
│   │   │   ├── habits/               # HabitCard, HabitHeatmapGrid, HabitModal
│   │   │   ├── study/                # StudyTimer, StudySessionHistory
│   │   │   └── analytics/            # StudyTrendChart, CategoryBreakdownChart, ProductivityHeatmap
│   │   ├── context/                  # AuthContext, ThemeContext, SyncContext
│   │   ├── pages/                    # Dashboard, Tasks, Habits, Study, Progress, Review, Settings, Login, Register
│   │   ├── utils/                    # dateUtils, routinePresets
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── test-e2e.js                       # Comprehensive automated integration test suite
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; v22 recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

### 1. Clone & Setup Backend
```bash
cd server
npm install
```

Configure `.env` in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/daytrack
JWT_SECRET=daytrack_production_grade_jwt_secret_token_2026_super_secure
NODE_ENV=development
```

Start the backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Setup Frontend Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://127.0.0.1:3000
```

### 3. Open in Browser
Visit `http://127.0.0.1:3000` on your desktop or mobile browser.
- Click **"Create account"** to register your profile.
- All 8 default life domains will be automatically pre-seeded for your account immediately!

---

## 🧪 Automated Testing

An end-to-end integration test suite is included at the root:
```bash
node test-e2e.js
```
Runs 21 automated assertions testing:
- Registration & JWT issuance
- Category pre-seeding
- Task creation, completion toggle, and rescheduling
- Dashboard percentage calculation
- Batch Plan Tomorrow rollover
- Habit streak incrementation and 60-day heatmap data
- Study timer session logging & Tech vs Govt effort ratio
- End-of-day review saving
- Growth analytics consolidation

---

## 🚀 Deployment Guide

### Deploying Backend (e.g. Render / Railway)
1. Push repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node src/server.js`.
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas cluster connection string.
   - `JWT_SECRET`: A long random secret string.
   - `NODE_ENV`: `production`

### Deploying Frontend (e.g. Vercel)
1. Create a new project on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g. `https://daytrack-api.onrender.com/api`).
5. Click **Deploy**.

---

## 📜 License

MIT License. Crafted for personal productivity, discipline, and long-term career growth.
