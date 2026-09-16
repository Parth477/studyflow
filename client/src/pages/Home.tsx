import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Circle, Loader2, LogOut, Pause, Play, Plus, RotateCcw, ShieldCheck, Sparkles, Timer } from "lucide-react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type AuthMode = "login" | "signup";
type Task = { id: number; user_id: string; title: string; completed: boolean; created_at: string };

function Brand() {
  return <div className="simple-brand"><span className="simple-brand-mark"><Sparkles size={16} /></span><span>study<span>flow</span></span></div>;
}

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const copy = mode === "login"
    ? { eyebrow: "Welcome back", title: "Make space to learn.", body: "A calm, private place for the work you want to finish.", action: "Sign in" }
    : { eyebrow: "Start simply", title: "Build your study flow.", body: "Create a secure account and keep your next steps in one place.", action: "Create account" };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (!supabaseConfigured) {
      setMessage("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.");
      return;
    }
    setBusy(true);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your account, then sign in.");
      setMode("login");
      setPassword("");
    }
  };

  return <main className="auth-page">
    <section className="auth-intro"><Brand /><div className="auth-intro-copy"><p className="auth-eyebrow"><span /> A quieter way to study</p><h1>Small steps.<br /><em>Clearer days.</em></h1><p>StudyFlow helps you keep your attention on the next useful thing — without the noise of a crowded productivity app.</p><div className="auth-note"><ShieldCheck size={17} /><span>Your account is protected by Supabase Auth and row-level security.</span></div></div><p className="auth-footer-note">© 2024 StudyFlow · Focus on what matters.</p></section>
    <section className="auth-panel-wrap"><form className="auth-panel" onSubmit={submit}>
      <div className="auth-panel-heading"><p>{copy.eyebrow}</p><h2>{copy.title}</h2><span>{copy.body}</span></div>
      <div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button type="button" className={mode === "login" ? "auth-tab-active" : ""} onClick={() => { setMode("login"); setMessage(""); }} role="tab" aria-selected={mode === "login"}>Sign in</button><button type="button" className={mode === "signup" ? "auth-tab-active" : ""} onClick={() => { setMode("signup"); setMessage(""); }} role="tab" aria-selected={mode === "signup"}>Create account</button></div>
      <label className="auth-field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
      <label className="auth-field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
      {message && <p className={`auth-message ${message.startsWith("Account created") ? "auth-message-success" : ""}`}>{message}</p>}
      <button className="oauth-button" type="submit" disabled={busy}><span className="oauth-symbol">◎</span>{busy ? "Working…" : `${copy.action} securely`}</button>
      <p className="auth-legal">Your password is handled by Supabase Auth. StudyFlow never stores it directly.</p><div className="auth-divider"><span>private by default</span></div><div className="auth-promise"><Check size={14} /><span>Your tasks belong only to your account.</span></div><div className="auth-promise"><Check size={14} /><span>Sign out any time from your workspace.</span></div>
    </form></section>
  </main>;
}

function Workspace({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [title, setTitle] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  const loadTasks = async () => {
    setLoadingTasks(true);
    setTaskError("");
    const { data, error } = await supabase.from("tasks").select("id, user_id, title, completed, created_at").order("created_at", { ascending: true });
    setLoadingTasks(false);
    if (error) { setTaskError(error.message); return; }
    setTasks((data ?? []) as Task[]);
  };

  useEffect(() => { void loadTasks(); }, [user.id]);
  useEffect(() => { if (!timerRunning || secondsLeft <= 0) return; const interval = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(interval); }, [timerRunning, secondsLeft]);
  useEffect(() => { if (secondsLeft === 0 && timerRunning) { setTimerRunning(false); toast.success("Focus session complete", { description: "Take a short break before your next task." }); } }, [secondsLeft, timerRunning]);

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const { data, error } = await supabase.from("tasks").insert({ user_id: user.id, title: cleanTitle }).select("id, user_id, title, completed, created_at").single();
    if (error) { toast.error(error.message); return; }
    setTasks((current) => [...current, data as Task]);
    setTitle("");
    toast.success("Task added");
  };

  const toggleTask = async (task: Task) => {
    const next = !task.completed;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: next } : item));
    const { error } = await supabase.from("tasks").update({ completed: next }).eq("id", task.id).eq("user_id", user.id);
    if (error) { setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: task.completed } : item)); toast.error(error.message); }
  };

  const logout = async () => { const { error } = await supabase.auth.signOut(); if (error) toast.error(error.message); else toast.success("You’re signed out"); };
  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const completedCount = tasks.filter((task) => task.completed).length;

  return <main className="workspace-page"><header className="workspace-header"><Brand /><div className="workspace-user"><div className="workspace-user-copy"><strong>{user.user_metadata?.full_name || "StudyFlow member"}</strong><span>{user.email}</span></div><button className="logout-button" onClick={logout}><LogOut size={15} /> Sign out</button></div></header><div className="workspace-content"><section className="workspace-welcome"><p className="auth-eyebrow"><span /> Your private workspace</p><h1>Hello, {displayName}.</h1><p>Keep today simple. What is the next thing you want to finish?</p></section><section className="focus-card-simple" aria-label="Focus timer"><div className="focus-card-heading"><div><p className="focus-label"><Timer size={13} /> Focus timer</p><strong>{timerLabel}</strong><span>{timerRunning ? "Session in progress" : secondsLeft === 0 ? "Session complete" : "Ready when you are"}</span></div><div className="focus-card-icon"><Timer size={19} /></div></div><div className="focus-actions"><button className="focus-primary" onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />} {timerRunning ? "Pause" : "Start focus"}</button><button className="focus-secondary" onClick={() => { setSecondsLeft(25 * 60); setTimerRunning(false); }}><RotateCcw size={14} /> Reset</button><button className="focus-secondary" onClick={() => { setSecondsLeft(5 * 60); setTimerRunning(false); }}>5 min</button></div></section><section className="task-card" aria-labelledby="tasks-heading"><div className="task-card-top"><div><h2 id="tasks-heading">Today’s tasks</h2><p>{completedCount} of {tasks.length} complete</p></div><div className="task-count">{tasks.length}</div></div><form className="task-form" onSubmit={addTask}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task…" aria-label="Task title" maxLength={160} /><button type="submit" disabled={!title.trim()} aria-label="Add task"><Plus size={17} /></button></form>{loadingTasks ? <div className="task-loading"><Loader2 size={18} className="spin" /> Loading your tasks…</div> : taskError ? <div className="task-empty"><ShieldCheck size={22} /><strong>Could not load tasks</strong><span>{taskError}</span><button onClick={() => void loadTasks()}>Try again</button></div> : tasks.length === 0 ? <div className="task-empty"><CheckCircle2 size={23} /><strong>Your list is clear</strong><span>Add one small task to begin.</span></div> : <div className="task-list">{tasks.map((task) => <div className={`simple-task ${task.completed ? "simple-task-done" : ""}`} key={task.id}><button className="simple-task-check" onClick={() => void toggleTask(task)} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>{task.completed ? <Check size={13} strokeWidth={3} /> : <Circle size={17} />}</button><span>{task.title}</span></div>)}</div>}</section><p className="workspace-security"><ShieldCheck size={14} /> Your tasks are stored securely with Supabase Row Level Security.</p></div></main>;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } }); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => { active = false; listener.subscription.unsubscribe(); }; }, []);
  if (loading) return <div className="auth-loading"><Loader2 size={22} className="spin" /><span>Checking your secure session…</span></div>;
  if (!session?.user) return <AuthScreen />;
  return <Workspace user={session.user} />;
}
