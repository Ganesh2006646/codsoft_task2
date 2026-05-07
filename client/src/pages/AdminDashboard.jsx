import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { ShieldAlert, Users, FolderOpen, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      toast.error("Access denied.");
      navigate("/dashboard");
      return;
    }

    axios.get("/api/admin/overview", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setHeads(r.data.heads))
      .catch(() => toast.error("Failed to load admin data."))
      .finally(() => setLoading(false));
  }, [token, user, navigate]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="card" style={{ height: "400px", background: "#f1f5f9" }} />
      </main>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        
        <div className="fade-in" style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "#fee2e2", padding: "12px", borderRadius: "12px" }}>
            <ShieldAlert size={28} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}>Admin Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>System overview of all Heads, Projects, and Users.</p>
          </div>
        </div>

        {heads.length === 0 ? (
          <div className="card fade-in" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#64748b" }}>No active heads or projects found in the system.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {heads.map((head, index) => (
              <div key={head._id} className={`card fade-in delay-${(index % 4) + 1}`} style={{ padding: "24px", borderLeft: "4px solid #2563eb" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={18} color="#2563eb" /> {head.name}
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 26px" }}>{head.email}</p>
                  </div>
                  <div style={{ background: "#eff6ff", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", color: "#2563eb" }}>
                    {head.projects.length} Project{head.projects.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {head.projects.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                    {head.projects.map(proj => (
                      <div key={proj._id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#334155", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FolderOpen size={14} color="#64748b" /> {proj.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {proj.description || "No description"}
                        </p>
                        
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                            Team Members ({proj.members?.length || 0})
                          </p>
                          {proj.members?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {proj.members.map(member => (
                                <div key={member._id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
                                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                                  <span style={{ fontSize: "12px", color: "#334155" }}>{member.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: "12px", color: "#cbd5e1", fontStyle: "italic" }}>No active members</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>This head has no active projects.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
