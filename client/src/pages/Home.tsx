import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Command,
  FileText,
  Flag,
  Flame,
  LayoutDashboard,
  ListChecks,
  Menu,
  MoreHorizontal,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  subject: string;
  time: string;
  duration: string;
  type: "lecture" | "practice" | "review" | "reading";
  done: boolean;
  accent: string;
};

const initialTasks: Task[] = [
  { id: 1, title: "Review neural networks", subject: "Computer Science", time: "09:00", duration: "45 min", type: "lecture", done: true, accent: "coral" },
  { id: 2, title: "Complete problem set 04", subject: "Linear Algebra", time: "10:00", duration: "60 min", type: "practice", done: false, accent: "mint" },
  { id: 3, title: "Read chapter 7: Memory", subject: "Cognitive Psychology", time: "11:30", duration: "35 min", type: "reading", done: false, accent: "lilac" },
  { id: 4, title: "Flashcards · spaced repetition", subject: "Spanish", time: "14:00", duration: "25 min", type: "review", done: false, accent: "sun" },
  { id: 5, title: "Outline research essay", subject: "Modern History", time: "15:00", duration: "50 min", type: "practice", done: false, accent: "blue" },
  { id: 6, title: "Weekly reflection", subject: "Personal growth", time: "17:00", duration: "20 min", type: "review", done: false, accent: "coral" },
];

const days = [
  { label: "Mon", date: "12", state: "complete" },
  { label: "Tue", date: "13", state: "active" },
  { label: "Wed", date: "14", state: "upcoming" },
  { label: "Thu", date: "15", state: "upcoming" },
  { label: "Fri", date: "16", state: "upcoming" },
  { label: "Sat", date: "17", state: "upcoming" },
  { label: "Sun", date: "18", state: "upcoming" },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My plan", icon: ListChecks, count: "6" },
  { label: "Calendar", icon: CalendarDays },
  { label: "Analytics", icon: TrendingUp },
];

function Logo() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Sparkles size={16} strokeWidth={2.4} /></div>
      <span>study<span>flow</span></span>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="progress-ring" style={{ "--progress": `${value * 3.6}deg` } as React.CSSProperties}>
      <div className="progress-ring-inner">
        <strong>{value}%</strong>
        <span>done</span>
      </div>
    </div>
  );
}

function TaskIcon({ type, done }: { type: Task["type"]; done: boolean }) {
  if (done) return <div className="task-icon task-icon-done"><Check size={15} strokeWidth={3} /></div>;
  const icons = { lecture: BookOpen, practice: NotebookPen, review: Brain, reading: FileText };
  const Icon = icons[type];
  return <div className={`task-icon task-icon-${type}`}><Icon size={16} /></div>;
}

function Home() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeNav, setActiveNav] = useState("Overview");
  const [activeDay, setActiveDay] = useState("13");
  const [filter, setFilter] = useState("All tasks");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  useEffect(() => {
    if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      toast.success("Focus session complete", { description: "Take a short break before your next block." });
    }
  }, [timerSeconds, timerRunning]);

  const completed = tasks.filter((task) => task.done).length;
  const visibleTasks = useMemo(() => {
    if (filter === "Completed") return tasks.filter((task) => task.done);
    if (filter === "To do") return tasks.filter((task) => !task.done);
    return tasks;
  }, [filter, tasks]);

  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
    const changed = tasks.find((task) => task.id === id);
    if (changed && !changed.done) toast.success("Nice work — task completed", { description: changed.title });
  };

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("Give your task a name first");
      return;
    }
    setTasks((current) => [...current, { id: Date.now(), title: newTask.trim(), subject: "Personal study", time: "18:00", duration: "30 min", type: "practice", done: false, accent: "blue" }]);
    setNewTask("");
    setShowAddTask(false);
    toast.success("Task added to your plan");
  };

  const formatTimer = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;
  const taskGroups = [
    { label: "Morning", range: "08:00 — 12:00", items: visibleTasks.filter((task) => Number(task.time.slice(0, 2)) < 12) },
    { label: "Afternoon", range: "12:00 — 17:00", items: visibleTasks.filter((task) => Number(task.time.slice(0, 2)) >= 12 && Number(task.time.slice(0, 2)) < 17) },
    { label: "Evening", range: "17:00 — 20:00", items: visibleTasks.filter((task) => Number(task.time.slice(0, 2)) >= 17) },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="close-mobile" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <div className="profile-chip">
          <div className="avatar">AM</div>
          <div className="profile-copy"><strong>Alex Morgan</strong><span>Design student</span></div>
          <ChevronDown size={16} className="profile-chevron" />
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "nav-item-active" : ""}`} onClick={() => { setActiveNav(label); setMobileMenu(false); if (label !== "Overview") toast(label === "My plan" ? "Your plan is right here" : `${label} view is coming next`); }}>
              <Icon size={18} strokeWidth={activeNav === label ? 2.4 : 1.9} />
              <span>{label}</span>
              {count && <b>{count}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-section-label library-label">Library</div>
        <nav className="main-nav">
          <button className="nav-item" onClick={() => toast("Notes view is coming next")}><FileText size={18} /><span>Notes</span></button>
          <button className="nav-item" onClick={() => toast("Study groups are coming next")}><Users size={18} /><span>Study groups</span></button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="streak-card">
          <div className="streak-glow" />
          <div className="streak-top"><span className="streak-icon"><Flame size={16} fill="currentColor" /></span><span>Current streak</span><button onClick={() => toast("7 focused days — keep going!")}><MoreHorizontal size={17} /></button></div>
          <div className="streak-number">7 <small>days</small></div>
          <div className="streak-note"><ArrowUpRight size={13} /> 2 more than last week</div>
        </div>
        <button className="settings-link" onClick={() => toast("Settings are coming next")}><Settings2 size={17} /> Settings</button>
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="icon-button search-button" onClick={() => toast("Search is ready when you are", { description: "Try searching by subject or task." })}><Search size={18} /><span>Search</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" onClick={() => toast("You're all caught up", { description: "No new notifications today." })} aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="top-avatar">AM</div>
          </div>
        </header>

        <div className="dashboard-wrap">
          <section className="welcome-row intro-animate">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> Tuesday, September 13, 2024</p>
              <h1>Good morning, Alex <span>✦</span></h1>
              <p className="welcome-subtitle">A little progress every day adds up to something big.</p>
            </div>
            <div className="welcome-actions">
              <button className="secondary-button" onClick={() => toast("Plan shared", { description: "Your study plan link is ready to share." })}><Users size={16} /> Share plan</button>
              <button className="primary-button" onClick={() => setShowAddTask(true)}><Plus size={17} /> Add task</button>
            </div>
          </section>

          <section className="stats-grid intro-animate delay-1">
            <div className="stat-card stat-card-featured">
              <div className="stat-card-head"><span className="stat-label">Today's progress</span><span className="status-pill"><span /> On track</span></div>
              <div className="stat-feature-content"><ProgressRing value={67} /><div className="stat-feature-copy"><strong>{completed + 3} <small>/ 6 tasks</small></strong><span>Keep your rhythm going.</span><button onClick={() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" })}>View today's plan <ArrowDownRight size={14} /></button></div></div>
            </div>
            <div className="stat-card"><div className="stat-card-head"><span className="stat-label">Focus time</span><span className="stat-icon-box peach"><Clock3 size={17} /></span></div><strong className="big-stat">2h 45m</strong><div className="stat-trend positive"><ArrowUpRight size={13} /> 18% <span>vs last week</span></div><div className="mini-bars"><i style={{ height: "42%" }} /><i style={{ height: "60%" }} /><i style={{ height: "52%" }} /><i style={{ height: "78%" }} /><i style={{ height: "68%" }} /><i className="today-bar" style={{ height: "92%" }} /><i style={{ height: "48%" }} /></div><div className="bar-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
            <div className="stat-card"><div className="stat-card-head"><span className="stat-label">Weekly goal</span><span className="stat-icon-box mint"><Target size={17} /></span></div><strong className="big-stat">8.5 <small>/ 12 hrs</small></strong><div className="stat-trend"><span>71% of your goal</span></div><div className="goal-progress"><span style={{ width: "71%" }} /></div><div className="goal-footer"><span>3h 30m left</span><span>Sunday</span></div></div>
          </section>

          <section className="content-grid intro-animate delay-2">
            <div className="plan-panel" id="plan">
              <div className="section-header"><div><h2>Your study plan</h2><p>Six focused blocks for a lighter, clearer day.</p></div><div className="section-controls"><button className="date-button" onClick={() => toast("Date picker is coming next")}><CalendarDays size={15} /> Sep 13 <ChevronDown size={14} /></button><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter tasks"><option>All tasks</option><option>To do</option><option>Completed</option></select></div></div>
              <div className="week-strip"><button className="week-arrow" onClick={() => toast("Previous week") }><ChevronLeft size={17} /></button>{days.map((day) => <button key={day.date} className={`day-cell ${activeDay === day.date ? "day-cell-active" : ""} ${day.state === "complete" ? "day-cell-complete" : ""}`} onClick={() => { setActiveDay(day.date); toast(`${day.label}, September ${day.date}`, { description: day.date === "13" ? "You are here" : "Plan view ready" }); }}><span>{day.label}</span><strong>{day.date}</strong>{day.state === "complete" && <i><Check size={10} strokeWidth={3} /></i>}</button>)}<button className="week-arrow" onClick={() => toast("Next week") }><ChevronRight size={17} /></button></div>

              {showAddTask && <div className="quick-add"><div className="quick-add-input"><Plus size={17} /><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTask()} placeholder="What do you want to study?" /><button onClick={() => setShowAddTask(false)} aria-label="Close add task"><X size={16} /></button></div><button className="quick-add-submit" onClick={addTask}>Add task</button></div>}

              <div className="task-list">{taskGroups.map((group) => group.items.length > 0 && <div className="task-group" key={group.label}><div className="group-label"><span>{group.label}</span><small>{group.range}</small></div>{group.items.map((task) => <div className={`task-row ${task.done ? "task-row-done" : ""}`} key={task.id}><button className="task-check" onClick={() => toggleTask(task.id)} aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>{task.done ? <Check size={13} strokeWidth={3} /> : <Circle size={15} />}</button><TaskIcon type={task.type} done={task.done} /><div className="task-copy"><strong>{task.title}</strong><span>{task.subject}</span></div><span className="task-time">{task.time}</span><span className="task-duration"><Clock3 size={13} /> {task.duration}</span><button className="task-more" onClick={() => toast("Task options", { description: "Editing and rescheduling are coming next." })} aria-label="More task options"><MoreHorizontal size={17} /></button></div>)}</div>)}{visibleTasks.length === 0 && <div className="empty-state"><CheckCircle2 size={24} /><strong>Nothing here yet</strong><span>Try another filter or add a fresh task.</span></div>}</div>
            </div>

            <aside className="right-rail">
              <div className="focus-card"><div className="focus-card-orb" /><div className="focus-card-top"><span className="focus-kicker"><Zap size={13} fill="currentColor" /> Focus session</span><button onClick={() => setTimerSeconds(25 * 60)} aria-label="Reset timer"><RotateCcw size={15} /></button></div><p className="focus-title">One thing at a time.</p><div className="timer-display">{formatTimer}</div><div className="timer-caption">{timerRunning ? "Session in progress" : "Ready when you are"}</div><div className="timer-actions"><button className="timer-main" onClick={() => { setTimerRunning((value) => !value); toast(timerRunning ? "Focus session paused" : "Focus session started"); }}>{timerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />} {timerRunning ? "Pause" : "Start focus"}</button><button className="timer-skip" onClick={() => { setTimerSeconds(5 * 60); toast("Short focus mode", { description: "A 5-minute reset can still move you forward." }); }}>5 min</button></div><div className="focus-footer"><span><TimerReset size={13} /> Pomodoro</span><span>25 + 5 min</span></div></div>

              <div className="insight-card"><div className="insight-heading"><span className="insight-spark"><Brain size={16} /></span><div><h3>A small insight</h3><p>Based on your recent activity</p></div></div><p className="insight-quote">“You’re most consistent when you start with a <em>short review</em> before deep work.”</p><div className="insight-data"><div><strong>84%</strong><span>completion after review</span></div><div className="insight-line" /><div><strong>+32m</strong><span>average focus time</span></div></div><button onClick={() => toast("Analytics view is coming next")}>See your patterns <ArrowUpRight size={14} /></button></div>

              <div className="up-next-card"><div className="section-mini-head"><h3>Up next</h3><button onClick={() => toast("Calendar view is coming next")}><MoreHorizontal size={17} /></button></div><div className="up-next-item"><div className="up-next-time">10:00</div><div className="up-next-line" /><div><strong>Problem set 04</strong><span>Linear Algebra · 60 min</span></div></div><div className="up-next-item muted-item"><div className="up-next-time">11:30</div><div className="up-next-line" /><div><strong>Chapter 7: Memory</strong><span>Cognitive Psychology · 35 min</span></div></div></div>
            </aside>
          </section>

          <footer className="dashboard-footer"><span>StudyFlow <b>·</b> Make room for what matters.</span><span><span className="online-dot" /> Synced just now</span></footer>
        </div>
      </main>
    </div>
  );
}

export default Home;
