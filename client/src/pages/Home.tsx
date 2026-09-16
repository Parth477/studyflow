import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, Circle, Loader2, LogOut, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type AuthMode = "login" | "signup";

function Brand() {
  return (
    <div className="simple-brand">
      <span className="simple-brand-mark"><Sparkles size={16} /></span>
      <span>study<span>flow</span></span>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const copy = mode === "login"
    ? { eyebrow: "Welcome back", title: "Make space to learn.", body: "A calm, private place for the work you want to finish.", action: "Sign in" }
    : { eyebrow: "Start simply", title: "Build your study flow.", body: "Create a secure account and keep your next steps in one place.", action: "Create account" };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div className="auth-intro-copy">
          <p className="auth-eyebrow"><span /> A quieter way to study</p>
          <h1>Small steps.<br /><em>Clearer days.</em></h1>
          <p>StudyFlow helps you keep your attention on the next useful thing — without the noise of a crowded productivity app.</p>
          <div className="auth-note"><ShieldCheck size={17} /><span>Your account is protected by secure OAuth authentication.</span></div>
        </div>
        <p className="auth-footer-note">© 2024 StudyFlow · Focus on what matters.</p>
      </section>
      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="auth-panel-heading"><p>{copy.eyebrow}</p><h2>{copy.title}</h2><span>{copy.body}</span></div>
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button className={mode === "login" ? "auth-tab-active" : ""} onClick={() => setMode("login")} role="tab" aria-selected={mode === "login"}>Sign in</button>
            <button className={mode === "signup" ? "auth-tab-active" : ""} onClick={() => setMode("signup")} role="tab" aria-selected={mode === "signup"}>Create account</button>
          </div>
          <button className="oauth-button" onClick={() => startLogin()}><span className="oauth-symbol">◎</span>{copy.action} securely</button>
          <p className="auth-legal">You’ll continue with the secure StudyFlow sign-in portal. No password is stored in this app.</p>
          <div className="auth-divider"><span>private by default</span></div>
          <div className="auth-promise"><Check size={14} /><span>Your tasks belong only to your account.</span></div>
          <div className="auth-promise"><Check size={14} /><span>Sign out any time from your workspace.</span></div>
        </div>
      </section>
    </main>
  );
}

function Workspace({ user, logout }: { user: { name?: string | null; email?: string | null }; logout: () => Promise<void> }) {
  const utils = trpc.useUtils();
  const taskQuery = trpc.tasks.list.useQuery(undefined, { retry: false });
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: async () => {
      await utils.tasks.list.invalidate();
      toast.success("Task added");
    },
    onError: (error) => toast.error(error.message || "Could not add that task"),
  });
  const toggleTask = trpc.tasks.toggle.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError: () => toast.error("Could not update that task"),
  });
  const [title, setTitle] = useState("");
  const tasks = taskQuery.data ?? [];
  const completedCount = tasks.filter((task) => task.completed === 1).length;
  const displayName = user.name?.split(" ")[0] || "there";

  const addTask = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    createTask.mutate({ title: cleanTitle });
    setTitle("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You’re signed out");
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  return (
    <main className="workspace-page">
      <header className="workspace-header"><Brand /><div className="workspace-user"><div className="workspace-user-copy"><strong>{user.name || "StudyFlow member"}</strong><span>{user.email || "Signed in securely"}</span></div><button className="logout-button" onClick={handleLogout}><LogOut size={15} /> Sign out</button></div></header>
      <div className="workspace-content">
        <section className="workspace-welcome"><p className="auth-eyebrow"><span /> Your private workspace</p><h1>Hello, {displayName}.</h1><p>Keep today simple. What is the next thing you want to finish?</p></section>
        <section className="task-card" aria-labelledby="tasks-heading">
          <div className="task-card-top"><div><h2 id="tasks-heading">Today’s tasks</h2><p>{completedCount} of {tasks.length} complete</p></div><div className="task-count">{tasks.length}</div></div>
          <form className="task-form" onSubmit={(event) => { event.preventDefault(); addTask(); }}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task…" aria-label="Task title" maxLength={160} /><button type="submit" disabled={!title.trim() || createTask.isPending} aria-label="Add task">{createTask.isPending ? <Loader2 size={16} className="spin" /> : <Plus size={17} />}</button></form>
          {taskQuery.isLoading ? <div className="task-loading"><Loader2 size={18} className="spin" /> Loading your tasks…</div> : taskQuery.isError ? <div className="task-empty"><ShieldCheck size={22} /><strong>Your workspace is private</strong><span>We couldn’t load tasks right now. Refresh and try again.</span><button onClick={() => taskQuery.refetch()}>Try again</button></div> : tasks.length === 0 ? <div className="task-empty"><CheckCircle2 size={23} /><strong>Your list is clear</strong><span>Add one small task to begin.</span></div> : <div className="task-list">{tasks.map((task) => { const done = task.completed === 1; return <div className={`simple-task ${done ? "simple-task-done" : ""}`} key={task.id}><button className="simple-task-check" onClick={() => toggleTask.mutate({ id: task.id, completed: !done })} aria-label={done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>{done ? <Check size={13} strokeWidth={3} /> : <Circle size={17} />}</button><span>{task.title}</span></div>; })}</div>}
        </section>
        <p className="workspace-security"><ShieldCheck size={14} /> Your tasks are stored securely and scoped to your account.</p>
      </div>
    </main>
  );
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="auth-loading"><Loader2 size={22} className="spin" /><span>Checking your secure session…</span></div>;
  if (!user) return <AuthScreen />;
  return <Workspace user={user} logout={logout} />;
}
