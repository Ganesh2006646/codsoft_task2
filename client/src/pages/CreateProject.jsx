import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { FolderPlus, ArrowLeft } from "lucide-react";

const CreateProject = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/projects", form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Project created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
        <button onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", background: "none", border: "none", cursor: "pointer", marginBottom: "24px", padding: 0 }}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        <h1 className="fade-in" style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#2563eb", borderRadius: "10px", padding: "8px", display: "flex" }}><FolderPlus size={18} color="#fff" /></div>
          New Project
        </h1>

        <form onSubmit={handleSubmit} className="card fade-in delay-1" style={{ padding: "28px" }}>
          <div style={{ marginBottom: "18px" }}>
            <label className="label">Project Title *</label>
            <input type="text" name="title" value={form.title} onChange={handle} required placeholder="e.g. Website Redesign" className="input-field-bare" />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={4} placeholder="Brief description of the project..." className="input-field-bare" />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label className="label">Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handle} className="input-field-bare" style={{ colorScheme: "light" }} />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "11px" }}>
              {loading ? <span className="spinner" /> : <><FolderPlus size={15} /> Create Project</>}
            </button>
            <button type="button" onClick={() => navigate("/dashboard")} className="btn-outline" style={{ padding: "11px 20px" }}>Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProject;
