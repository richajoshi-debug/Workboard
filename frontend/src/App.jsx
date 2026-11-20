import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListTodo, LogOut, Plus, Search, CheckCircle2, Clock3, CircleDashed, Menu, X, Sparkles } from "lucide-react";
import api from "./services/api";
import { getErrorMessage, initials } from "./utils";

function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        // Backend currently accepts email and password as query parameters.
        await api.post("/auth/register", null, { params: { email, password } });
      }
      // OAuth2PasswordRequestForm expects form-encoded username/password.
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);
      const response = await api.post("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      localStorage.setItem("workboard_token", response.data.access_token);
      const me = await api.get("/auth/me");
      localStorage.setItem("workboard_user", JSON.stringify(me.data));
      onAuth(me.data);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, isRegister ? "Could not create account." : "Login failed. Check your credentials."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="brand brand-light"><span className="brand-mark"><ListTodo size={21}/></span> WorkBoard</div>
        <div className="auth-pitch">
          <span className="eyebrow"><Sparkles size={14}/> YOUR WORK, IN FLOW</span>
          <h1>Make space for<br/><em>meaningful work.</em></h1>
          <p>Bring your tasks together, keep priorities clear, and make progress you can see.</p>
          <div className="visual-task">
            <div className="visual-task-icon"><CheckCircle2 size={19}/></div>
            <div><strong>Plan the week</strong><small>Stay focused on what matters</small></div>
            <span className="visual-done">Done</span>
          </div>
          <div className="visual-task second">
            <div className="visual-task-icon violet"><Clock3 size={19}/></div>
            <div><strong>Build momentum</strong><small>One task at a time</small></div>
            <span className="visual-pending">In progress</span>
          </div>
        </div>
        <div className="auth-foot">A calmer way to get things done.</div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form-card">
          <div className="mobile-brand brand"><span className="brand-mark"><ListTodo size={21}/></span> WorkBoard</div>
          <div className="form-kicker">{isRegister ? "GET STARTED" : "WELCOME BACK"}</div>
          <h2>{isRegister ? "Create your account" : "Sign in to WorkBoard"}</h2>
          <p className="muted">{isRegister ? "Set up your workspace and start organizing." : "Enter your details to continue to your workspace."}</p>
          <form onSubmit={submit} className="auth-form">
            <label>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email"/>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required minLength={1} autoComplete={isRegister ? "new-password" : "current-password"}/>
            {error && <div className="alert">{error}</div>}
            <button className="primary-btn full-btn" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"} <span>→</span></button>
          </form>
          <p className="switch-auth">{isRegister ? "Already have an account?" : "New to WorkBoard?"} <button onClick={() => navigate(isRegister ? "/login" : "/register")}>{isRegister ? "Sign in" : "Create an account"}</button></p>
          <div className="secure-note"><span/> Your workspace is private and secure</div>
        </div>
      </section>
    </main>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "pending");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await onSave({ title: title.trim(), description: description.trim(), status });
    setBusy(false);
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal">
        <div className="modal-head"><div><span className="form-kicker">{task ? "EDIT TASK" : "NEW TASK"}</span><h2>{task ? "Update task" : "Create a task"}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
        <form onSubmit={submit} className="task-form">
          <label>Task title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Prepare project update" required maxLength={120}/>
          <label>Description <span className="optional">Optional</span></label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a few details..." rows={4}/>
          <label>Status</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="pending">Pending</option><option value="in progress">In progress</option><option value="completed">Completed</option></select>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={busy || !title.trim()}>{busy ? "Saving..." : task ? "Save changes" : "Create task"}</button></div>
        </form>
      </section>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const navigate = useNavigate();

  async function loadTasks() {
    setLoading(true); setError("");
    try {
      const response = await api.get("/tasks");
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load tasks. Check that your backend is running."));
    } finally { setLoading(false); }
  }
  useEffect(() => { loadTasks(); }, []);

  async function saveTask(payload) {
    try {
      if (modal?.id) await api.put(`/tasks/${modal.id}`, payload);
      else await api.post("/tasks", payload);
      setModal(null); await loadTasks();
    } catch (err) { setError(getErrorMessage(err, "Unable to save this task.")); }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task? This action cannot be undone.")) return;
    try { await api.delete(`/tasks/${id}`); await loadTasks(); }
    catch (err) { setError(getErrorMessage(err, "Unable to delete this task.")); }
  }

  async function changeStatus(task, status) {
    try {
      await api.put(`/tasks/${task.id}`, { title: task.title, description: task.description || "", status });
      await loadTasks();
    } catch (err) { setError(getErrorMessage(err, "Unable to update task status.")); }
  }

  const completed = tasks.filter(t => String(t.status).toLowerCase() === "completed").length;
  const inProgress = tasks.filter(t => String(t.status).toLowerCase() === "in progress").length;
  const pending = tasks.length - completed - inProgress;
  const visible = tasks.filter(t => {
    const matchesText = `${t.title} ${t.description || ""}`.toLowerCase().includes(query.toLowerCase());
    const normalized = String(t.status || "pending").toLowerCase();
    return matchesText && (filter === "all" || normalized === filter);
  });
  const email = user?.email || "Your workspace";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark"><ListTodo size={21}/></span> WorkBoard</div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active" onClick={() => { setFilter("all"); setMobileNav(false); }}><LayoutDashboard size={18}/> Overview</button>
        <button className="nav-item" onClick={() => { setFilter("all"); setMobileNav(false); }}><ListTodo size={18}/> All tasks <span className="nav-count">{tasks.length}</span></button>
        <div className="sidebar-bottom">
          <div className="profile"><div className="avatar">{initials(email)}</div><div className="profile-info"><strong>{email.split("@")[0]}</strong><small>{email}</small></div></div>
          <button className="nav-item logout" onClick={onLogout}><LogOut size={18}/> Sign out</button>
        </div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)}/>}
      <main className="main-area">
        <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-right"><span className="online-dot"/> Workspace active <div className="avatar small-avatar">{initials(email)}</div></div></header>
        <div className="content">
          <div className="welcome-row"><div><div className="form-kicker">YOUR OVERVIEW</div><h1>Good to see you, {email.split("@")[0]} <span className="wave">✦</span></h1><p className="muted">Here’s what’s happening with your work today.</p></div><button className="primary-btn create-btn" onClick={() => setModal({})}><Plus size={18}/> New task</button></div>
          {error && <div className="alert page-alert">{error} <button onClick={() => setError("")}>Dismiss</button></div>}
          <section className="stats-grid">
            <StatCard label="Total tasks" value={tasks.length} icon={<ListTodo size={19}/>} tone="blue" foot="Across your workspace"/>
            <StatCard label="In progress" value={inProgress} icon={<Clock3 size={19}/>} tone="violet" foot="Work underway"/>
            <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={19}/>} tone="green" foot="Nicely done"/>
            <StatCard label="Pending" value={pending} icon={<CircleDashed size={19}/>} tone="amber" foot="Ready when you are"/>
          </section>
          <section className="tasks-panel">
            <div className="panel-head"><div><h2>Your tasks</h2><p className="muted">Keep track of the details and make progress.</p></div><div className="task-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..."/></div></div></div>
            <div className="filter-row">{[["all","All tasks"],["pending","Pending"],["in progress","In progress"],["completed","Completed"]].map(([key,label]) => <button key={key} className={`filter-chip ${filter === key ? "selected" : ""}`} onClick={() => setFilter(key)}>{label}{key === "all" && <span>{tasks.length}</span>}</button>)}</div>
            {loading ? <div className="empty-state"><div className="loader"/><p>Loading your tasks...</p></div> :
              visible.length === 0 ? <div className="empty-state"><div className="empty-icon"><ListTodo size={24}/></div><h3>{tasks.length ? "No matching tasks" : "Your board is ready"}</h3><p>{tasks.length ? "Try another search or status filter." : "Create your first task and start organizing your work."}</p>{!tasks.length && <button className="primary-btn" onClick={() => setModal({})}><Plus size={17}/> Create your first task</button>}</div> :
              <div className="task-list">{visible.map(task => <article className="task-row" key={task.id}><div className={`task-status-icon ${String(task.status).toLowerCase() === "completed" ? "done" : String(task.status).toLowerCase() === "in progress" ? "doing" : ""}`}>{String(task.status).toLowerCase() === "completed" ? <CheckCircle2 size={19}/> : String(task.status).toLowerCase() === "in progress" ? <Clock3 size={19}/> : <CircleDashed size={19}/>}</div><div className="task-main"><h3 className={String(task.status).toLowerCase() === "completed" ? "task-complete" : ""}>{task.title}</h3><p>{task.description || "No description added."}</p></div><select className={`status-select ${String(task.status).toLowerCase().replace(" ","-")}`} value={task.status || "pending"} onChange={(e) => changeStatus(task,e.target.value)} aria-label={`Status for ${task.title}`}><option value="pending">Pending</option><option value="in progress">In progress</option><option value="completed">Completed</option></select><div className="task-actions"><button className="text-action" onClick={() => setModal(task)}>Edit</button><button className="text-action delete-action" onClick={() => deleteTask(task.id)}>Delete</button></div></article>)}</div>}
          </section>
          <footer className="page-footer">WorkBoard <span>·</span> Make progress, one task at a time.</footer>
        </div>
      </main>
      {modal && <TaskModal task={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveTask}/>}
    </div>
  );
}

function StatCard({ label, value, icon, tone, foot }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("workboard_user") || "null"); } catch { return null; }
  });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem("workboard_token")));
  const location = useLocation();

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!localStorage.getItem("workboard_token")) { setChecking(false); return; }
      try {
        const response = await api.get("/auth/me");
        if (active) { setUser(response.data); localStorage.setItem("workboard_user", JSON.stringify(response.data)); }
      } catch {
        localStorage.removeItem("workboard_token"); localStorage.removeItem("workboard_user");
        if (active) setUser(null);
      } finally { if (active) setChecking(false); }
    }
    verify();
    return () => { active = false; };
  }, []);

  function logout() {
    localStorage.removeItem("workboard_token");
    localStorage.removeItem("workboard_user");
    setUser(null);
  }

  if (checking) return <div className="screen-loading"><div className="loader"/><span>Opening your workspace...</span></div>;

  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace/> : <AuthPage key="login" mode="login" onAuth={setUser}/>}/>
    <Route path="/register" element={user ? <Navigate to="/" replace/> : <AuthPage key="register" mode="register" onAuth={setUser}/>}/>
    <Route path="*" element={user ? <Dashboard key={location.pathname} user={user} onLogout={logout}/> : <Navigate to="/login" replace/>}/>
  </Routes>;
}
