import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { FolderPlus, LayoutGrid, ListChecks, CheckCircle2, TrendingUp, Users, UserCheck, Bell, Check } from "lucide-react";

const Dashboard = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [communityProjects, setCommunityProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const isHead = user?.role === "head";

  useEffect(() => {
    const fetches = [
      axios.get("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
    ];
    if (!isHead) {
      fetches.push(axios.get("/api/projects/community", { headers: { Authorization: `Bearer ${token}` } }));
    }

    Promise.all(fetches)
      .then(([myRes, commRes]) => {
        setProjects(myRes.data);
        if (commRes) setCommunityProjects(commRes.data);
      })
      .catch(() => toast.error("Failed to load projects."))
      .finally(() => setLoading(false));
  }, [token, isHead]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await axios.delete(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success("Project deleted.");
    } catch { toast.error("Failed to delete project."); }
  };

  const handleRequestJoin = async (id) => {
    try {
      const { data } = await axios.post(`/api/projects/${id}/request`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request.");
    }
  };

  const handleAcceptRequest = async (projectId, userId) => {
    try {
      const { data } = await axios.post(`/api/projects/${projectId}/accept`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(data.message);
      // Refresh projects to update requests and members
      const { data: updated } = await axios.get("/api/projects", { headers: { Authorization: `Bearer ${token}` } });
      setProjects(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request.");
    }
  };

  // ── Head computed values ──
  const ownedProjects = isHead ? projects.filter(p => p.owner?._id === user?.id || p.owner === user?.id) : [];

  // All unique team members with which project(s) they're in
  const teamMembersMap = {};
  ownedProjects.forEach(proj => {
    (proj.members || []).forEach(member => {
      if (!teamMembersMap[member._id]) teamMembersMap[member._id] = { ...member, projects: [] };
      teamMembersMap[member._id].projects.push(proj.title);
    });
  });
  const teamMembers = Object.values(teamMembersMap);

  // All pending requests across all owned projects
  const pendingRequests = [];
  ownedProjects.forEach(proj => {
    (proj.requests || []).forEach(req => {
      pendingRequests.push({ ...req, projectId: proj._id, projectTitle: proj.title });
    });
  });

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
            {greeting}, <span style={{ color: "#2563eb" }}>{user?.name}</span> {isHead ? "🎯" : "👋"}
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            {isHead ? "You are a Project Head — manage your projects, team, and requests below." : "Browse and request to join community projects below."}
          </p>
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

        {/* ── HEAD LAYOUT ── */}
        {isHead && (
          <>
            {/* Your Projects (Head) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Your Projects</h2>
              <Link to="/create-project" className="btn-primary" style={{ textDecoration: "none", padding: "9px 16px" }}>
                <FolderPlus size={15} /> New Project
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                {[1,2,3].map(i => <div key={i} className="card" style={{ height: "180px", background: "#f1f5f9" }} />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="card fade-in" style={{ padding: "60px 20px", textAlign: "center", marginBottom: "40px" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                {projects.map((p, i) => <ProjectCard key={p._id} project={p} onDelete={handleDelete} index={i} />)}
              </div>
            )}

            {/* Pending Join Requests */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", marginTop: "8px" }}>
              <Bell size={20} color="#d97706" />
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Pending Join Requests</h2>
              {pendingRequests.length > 0 && (
                <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "12px", fontWeight: "700", padding: "2px 10px", borderRadius: "20px", border: "1px solid #fde68a" }}>
                  {pendingRequests.length}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: "40px" }}>
                {[1,2].map(i => <div key={i} className="card" style={{ height: "80px", background: "#f1f5f9" }} />)}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="card fade-in" style={{ padding: "28px 20px", textAlign: "center", marginBottom: "40px" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>No pending requests at the moment.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: "40px" }}>
                {pendingRequests.map((req, i) => (
                  <div key={`${req._id}-${req.projectId}`} className={`card fade-in delay-${i % 4}`} style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", flexShrink: 0 }}>
                      {req.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px", margin: 0 }}>{req.name}</p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0" }}>{req.email}</p>
                      <p style={{ fontSize: "11px", color: "#2563eb", margin: 0, fontWeight: "600" }}>→ {req.projectTitle}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(req.projectId, req._id)}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <Check size={13} /> Accept
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* My Team Members */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <UserCheck size={20} color="#2563eb" />
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>My Team Members</h2>
              <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "700", padding: "2px 10px", borderRadius: "20px" }}>
                {teamMembers.length}
              </span>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {[1,2,3].map(i => <div key={i} className="card" style={{ height: "80px", background: "#f1f5f9" }} />)}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="card fade-in" style={{ padding: "32px 20px", textAlign: "center" }}>
                <Users size={28} color="#cbd5e1" style={{ margin: "0 auto 10px" }} />
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>No team members yet. Accept requests above to grow your team.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {teamMembers.map((member, i) => (
                  <div key={member._id} className={`card fade-in delay-${i % 4}`} style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>{member.email}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {member.projects.map(proj => (
                          <span key={proj} style={{ fontSize: "10px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "2px 6px", borderRadius: "4px" }}>{proj}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── REGULAR USER LAYOUT ── */}
        {!isHead && (
          <>
            {/* Joined Projects */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>My Projects</h2>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                {[1,2,3].map(i => <div key={i} className="card" style={{ height: "180px", background: "#f1f5f9" }} />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="card fade-in" style={{ padding: "40px 20px", textAlign: "center", marginBottom: "40px" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>You haven't joined any projects yet. Browse community projects below and send a request!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                {projects.map((p, i) => <ProjectCard key={p._id} project={p} onDelete={handleDelete} index={i} />)}
              </div>
            )}

            {/* Community Projects */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", marginTop: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Community Projects</h2>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {[1,2,3].map(i => <div key={i} className="card" style={{ height: "140px", background: "#f1f5f9" }} />)}
              </div>
            ) : communityProjects.length === 0 ? (
              <div className="card fade-in" style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "14px" }}>No community projects available to join right now.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {communityProjects.map((p, i) => (
                  <div key={p._id} className={`card fade-in delay-${i % 4}`} style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>{p.title}</h3>
                      <p style={{ fontSize: "13px", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.description || "No description provided."}
                      </p>
                    </div>
                    <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Head: <strong style={{ color: "#475569" }}>{p.owner?.name}</strong></span>
                      <button onClick={() => handleRequestJoin(p._id)} className="btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        <Users size={14} /> Request to Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
