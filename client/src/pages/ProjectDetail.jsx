import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import { ArrowLeft, Plus, X, Calendar, User, ListTodo, Clock, CheckCircle2 } from "lucide-react";

const COLS = ["Todo", "In Progress", "Done"];
const colCfg = {
  "Todo":         { icon: ListTodo,     color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  "In Progress":  { icon: Clock,        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  "Done":         { icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};
const emptyTask = { title: "", description: "", assignee: "", dueDate: "" };

const ProjectDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    Promise.all([
      axios.get(`/api/projects/${id}`, auth),
      axios.get(`/api/tasks/${id}`, auth),
    ]).then(([p, t]) => { setProject(p.data); setTasks(t.data); })
      .catch(() => { toast.error("Failed to load project."); navigate("/dashboard"); })
      .finally(() => setLoading(false));
  }, [id]);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAddTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post("/api/tasks", { ...taskForm, project: id }, auth);
      setTasks(prev => [data, ...prev]);
      setTaskForm(emptyTask);
      setShowModal(false);
      toast.success("Task added!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add task."); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus }, auth);
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
      toast.success(`Moved to ${newStatus}`);
    } catch { toast.error("Failed to update."); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`, auth);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success("Task deleted.");
    } catch { toast.error("Failed to delete task."); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {[1,2].map(i => <div key={i} className="card" style={{ height: "120px", background: "#f1f5f9", marginBottom: "16px" }} />)}
      </main>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Back */}
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", background: "none", border: "none", cursor: "pointer", marginBottom: "20px", padding: 0 }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Project Header Card */}
        <div className="card fade-in" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" }}>{project?.title}</h1>
              {project?.description && <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>{project.description}</p>}
              {project?.deadline && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                  <Calendar size={13} color="#2563eb" />
                  Deadline: {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ whiteSpace: "nowrap" }}>
              <Plus size={15} /> Add Task
            </button>
          </div>

          {/* Progress */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>{done} / {total} tasks completed</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: progress === 100 ? "#16a34a" : "#2563eb" }}>{progress}%</span>
            </div>
            <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, borderRadius: "99px", background: progress === 100 ? "#22c55e" : "#2563eb", transition: "width 0.7s ease" }} />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {total === 0 ? (
          <div className="card fade-in" style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", background: "#eff6ff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Plus size={24} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>No tasks yet</h3>
            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "18px" }}>Add your first task to get started.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={14} /> Add Task</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {COLS.map(col => {
              const { icon: Icon, color, bg, border } = colCfg[col];
              const colTasks = tasks.filter(t => t.status === col);
              return (
                <div key={col} style={{ background: "#fff", border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
                  <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: "700", color }}>
                      <Icon size={15} /> {col}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color, background: "#fff", border: `1px solid ${border}`, borderRadius: "99px", padding: "2px 8px" }}>
                      {colTasks.length}
                    </span>
                  </div>
                  <div style={{ padding: "12px", minHeight: "100px" }}>
                    {colTasks.length === 0
                      ? <p style={{ textAlign: "center", fontSize: "12px", color: "#cbd5e1", paddingTop: "20px" }}>No tasks here</p>
                      : colTasks.map(task => (
                          <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
                        ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(15,23,42,0.4)" }}>
          <div className="card fade-in" style={{ width: "100%", maxWidth: "480px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#2563eb" /> Add Task
              </h2>
              <button onClick={() => { setShowModal(false); setTaskForm(emptyTask); }} style={{ padding: "5px", border: "none", background: "#f1f5f9", borderRadius: "6px", cursor: "pointer", color: "#64748b" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTask}>
              <div style={{ marginBottom: "14px" }}>
                <label className="label">Task Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="e.g. Design homepage" className="input-field-bare" />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label className="label">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} placeholder="Optional..." className="input-field-bare" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
                <div>
                  <label className="label"><User size={12} style={{ display: "inline", marginRight: "4px" }} />Assignee</label>
                  <input type="text" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })} placeholder="Name" className="input-field-bare" />
                </div>
                <div>
                  <label className="label"><Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input-field-bare" style={{ colorScheme: "light" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {saving ? <span className="spinner" /> : <><Plus size={14} /> Add Task</>}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setTaskForm(emptyTask); }} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
