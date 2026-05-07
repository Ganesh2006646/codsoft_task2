import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { FolderPlus, LayoutGrid, ListChecks, CheckCircle2, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/projects", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setProjects(r.data))
      .catch(() => toast.error("Failed to load projects."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await axios.delete(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success("Project deleted.");
    } catch { toast.error("Failed to delete project."); }
  };

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((s, p) => s + (p.totalTasks || 0), 0);
  const completedTasks = projects.reduce((s, p) => s + (p.completedTasks || 0), 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    { label: "Projects", value: totalProjects, icon: LayoutGrid, color: "#2563eb", bg: "#eff6ff" },
    { label: "Total Tasks", value: totalTasks, icon: ListChecks, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Progress", value: `${progress}%`, icon: TrendingUp, color: "#d97706", bg: "#fffbeb" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Greeting */}
        <div className="fade-in" style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}>
            {greeting}, <span style={{ color: "#2563eb" }}>{user?.name}</span> 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>Here's an overview of your projects and tasks.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={label} className={`card fade-in delay-${i + 1}`} style={{ padding: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontSize: "26px", fontWeight: "800", color: color, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Your Projects</h2>
          <Link to="/create-project" className="btn-primary" style={{ textDecoration: "none", padding: "9px 16px" }}>
            <FolderPlus size={15} /> New Project
          </Link>
        </div>

        {/* Projects */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[1,2,3].map(i => <div key={i} className="card" style={{ height: "180px", background: "#f1f5f9" }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card fade-in" style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#eff6ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <FolderPlus size={28} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>No projects yet</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Create your first project to get started.</p>
            <Link to="/create-project" className="btn-primary" style={{ textDecoration: "none" }}>
              <FolderPlus size={15} /> Create Project
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {projects.map((p, i) => <ProjectCard key={p._id} project={p} onDelete={handleDelete} index={i} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
