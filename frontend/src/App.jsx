import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, CheckCircle2, Circle, ClipboardList, LogOut, Plus, Trash2, CalendarDays, LayoutDashboard } from "lucide-react";

const API = "http://localhost:5000/api";
const api = axios.create({ baseURL: API });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("smartstudy_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("smartstudy_user") || "null"));
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", subjectId: "", dueDate: "" });
  const [subjectName, setSubjectName] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const notify = (msg) => { setMessage(msg); window.setTimeout(() => setMessage(""), 3000); };
  const loadData = async () => {
    const [t, s] = await Promise.all([api.get("/tasks"), api.get("/subjects")]);
    setTasks(t.data); setSubjects(s.data);
  };

  useEffect(() => {
    if (user) loadData().catch(() => notify("Could not load data. Please log in again."));
  }, [user]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    pending: tasks.filter(t => t.status === "Pending").length
  }), [tasks]);
  const progress = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;
  const visibleTasks = tasks.filter(t => filter === "All" || t.status === filter);

  const authenticate = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const { data } = await axios.post(`${API}${endpoint}`, authForm);
      localStorage.setItem("smartstudy_token", data.token);
      localStorage.setItem("smartstudy_user", JSON.stringify(data.user));
      setUser(data.user); notify(`Welcome, ${data.user.name}!`);
    } catch (err) { notify(err.response?.data?.message || "Unable to connect to server"); }
    finally { setBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem("smartstudy_token"); localStorage.removeItem("smartstudy_user");
    setUser(null); setTasks([]); setSubjects([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", taskForm);
      setTaskForm({ title: "", description: "", subjectId: "", dueDate: "" });
      await loadData(); notify("Task added successfully");
    } catch (err) { notify(err.response?.data?.message || "Could not add task"); }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    try { await api.post("/subjects", { subjectName }); setSubjectName(""); await loadData(); notify("Subject added"); }
    catch (err) { notify(err.response?.data?.message || "Could not add subject"); }
  };

  const toggleTask = async (task) => {
    try { await api.put(`/tasks/${task._id}`, { status: task.status === "Completed" ? "Pending" : "Completed" }); await loadData(); }
    catch { notify("Could not update task"); }
  };
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${id}`); await loadData(); notify("Task deleted"); }
    catch { notify("Could not delete task"); }
  };
  const deleteSubject = async (id) => {
    try { await api.delete(`/subjects/${id}`); await loadData(); notify("Subject deleted"); }
    catch { notify("Could not delete subject"); }
  };

  if (!user) return <main className="auth-page">
    <section className="auth-card">
      <div className="brand-mark"><BookOpen size={27} /></div>
      <p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
      <h1>SmartStudy</h1>
      <p className="muted">Plan smart. Study better. Achieve more.</p>
      <div className="tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button></div>
      <form onSubmit={authenticate} className="form-stack">
        {mode === "register" && <label>Full name<input required value={authForm.name} onChange={e => setAuthForm({...authForm, name:e.target.value})} placeholder="Your name" /></label>}
        <label>Email address<input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email:e.target.value})} placeholder="student@example.com" /></label>
        <label>Password<input required minLength="6" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password:e.target.value})} placeholder="At least 6 characters" /></label>
        <button className="primary full" disabled={busy}>{busy ? "Please wait..." : mode === "register" ? "Create account" : "Login to dashboard"}</button>
      </form>
      <p className="tiny muted">Your study tasks are saved securely to your account.</p>
    </section>
    {message && <div className="toast">{message}</div>}
  </main>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark small"><BookOpen size={20}/></span><b>SmartStudy</b></div>
      <div className="nav-label">WORKSPACE</div>
      <a className="nav-item selected"><LayoutDashboard size={18}/> Dashboard</a>
      <a className="nav-item"><ClipboardList size={18}/> My tasks</a>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div><b>{user.name}</b><small>Student account</small></div></div><button className="logout" onClick={logout}><LogOut size={17}/> Log out</button></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><p className="eyebrow">STUDENT WORKSPACE</p><h2>Good to see you, {user.name} 👋</h2><p className="muted">Here's your study progress at a glance.</p></div><div className="date-chip"><CalendarDays size={17}/>{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div></header>

      <section className="stats-grid">
        <article className="stat-card"><span className="stat-icon purple"><ClipboardList/></span><p>Total tasks</p><strong>{stats.total}</strong><small>All your study activities</small></article>
        <article className="stat-card"><span className="stat-icon green"><CheckCircle2/></span><p>Completed</p><strong>{stats.completed}</strong><small>Tasks finished</small></article>
        <article className="stat-card"><span className="stat-icon orange"><Circle/></span><p>Pending</p><strong>{stats.pending}</strong><small>Still to be done</small></article>
        <article className="stat-card"><span className="stat-icon blue"><BookOpen/></span><p>Progress</p><strong>{progress}%</strong><small>Overall completion</small><div className="progress-track"><div style={{width:`${progress}%`}}/></div></article>
      </section>

      <div className="content-grid">
        <section className="panel task-panel">
          <div className="panel-heading"><div><h3>My study tasks</h3><p className="muted">Keep moving toward your goals.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Pending</option><option>Completed</option></select></div>
          <div className="task-list">
            {visibleTasks.length === 0 && <div className="empty"><ClipboardList size={32}/><b>No tasks here yet</b><span>Add a task to get started.</span></div>}
            {visibleTasks.map(task=><article className={`task-row ${task.status === "Completed" ? "is-done" : ""}`} key={task._id}>
              <button className="check-btn" title="Change status" onClick={()=>toggleTask(task)}>{task.status === "Completed" ? <CheckCircle2/> : <Circle/>}</button>
              <div className="task-info"><b>{task.title}</b><p>{task.description || "No description"} · {task.subjectId?.subjectName || "No subject"}</p>{task.dueDate && <small><CalendarDays size={13}/> Due {new Date(task.dueDate).toLocaleDateString()}</small>}</div>
              <span className={`status ${task.status === "Completed" ? "done" : "waiting"}`}>{task.status}</span>
              <button className="icon-btn" title="Delete task" onClick={()=>deleteTask(task._id)}><Trash2 size={17}/></button>
            </article>)}
          </div>
        </section>

        <section className="panel add-panel">
          <div className="panel-heading"><div><h3>Add a task</h3><p className="muted">Break your goals into steps.</p></div><span className="plus-circle"><Plus/></span></div>
          <form onSubmit={addTask} className="form-stack compact">
            <label>Task title<input required placeholder="e.g. Study DBMS Unit 1" value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})}/></label>
            <label>Description<textarea rows="3" placeholder="What do you need to complete?" value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})}/></label>
            <label>Subject<select value={taskForm.subjectId} onChange={e=>setTaskForm({...taskForm,subjectId:e.target.value})}><option value="">Select subject (optional)</option>{subjects.map(s=><option key={s._id} value={s._id}>{s.subjectName}</option>)}</select></label>
            <label>Due date<input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})}/></label>
            <button className="primary"><Plus size={17}/> Add task</button>
          </form>
        </section>
      </div>

      <section className="panel subjects-panel">
        <div className="panel-heading"><div><h3>My subjects</h3><p className="muted">Organize your tasks by subject.</p></div></div>
        <form className="subject-form" onSubmit={addSubject}><input value={subjectName} onChange={e=>setSubjectName(e.target.value)} placeholder="Enter subject name (e.g. Java)" /><button className="primary"><Plus size={16}/> Add subject</button></form>
        <div className="subject-list">{subjects.map(s=><span className="subject-chip" key={s._id}><BookOpen size={15}/>{s.subjectName}<button title="Delete subject" onClick={()=>deleteSubject(s._id)}>×</button></span>)}{subjects.length===0 && <p className="muted tiny">No subjects added yet.</p>}</div>
      </section>
      <footer>Made for students · <b>SmartStudy</b></footer>
    </main>
    {message && <div className="toast">{message}</div>}
  </div>;
}
