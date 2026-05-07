import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock, Boxes, Zap } from "lucide-react";

const DEMO = { email: "demo@projecthub.com", password: "demo1234" };

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fillDemo = () => {
    setForm(DEMO);
    toast("Demo credentials filled in!", { icon: "⚡" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #dbeafe 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div className="fade-in" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", padding: "14px", borderRadius: "16px", background: "#2563eb", marginBottom: "14px", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
            <Boxes size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#1e293b", marginBottom: "5px" }}>Welcome Back</h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>Sign in to manage your projects</p>
        </div>

        {/* ── Demo Credentials Box ── */}
        <div className="fade-in delay-1" style={{ background: "#fff", border: "2px solid #bfdbfe", borderRadius: "14px", padding: "16px 18px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ background: "#2563eb", borderRadius: "6px", padding: "4px", display: "flex" }}>
                <Zap size={13} color="#fff" />
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>Demo Account</span>
            </div>
            <button onClick={fillDemo} style={{ fontSize: "12px", fontWeight: "600", color: "#fff", background: "#2563eb", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer" }}>
              Auto-fill ⚡
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "4px 8px", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Email</span>
            <span style={{ fontWeight: "600", color: "#1e293b", fontFamily: "monospace" }}>{DEMO.email}</span>
            <span style={{ color: "#64748b" }}>Password</span>
            <span style={{ fontWeight: "600", color: "#1e293b", fontFamily: "monospace" }}>{DEMO.password}</span>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card fade-in delay-2" style={{ padding: "28px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label className="label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input type="email" name="email" value={form.email} onChange={handle} required placeholder="you@example.com" className="input-field" />
            </div>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label className="label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input type="password" name="password" value={form.password} onChange={handle} required placeholder="••••••••" className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            {loading ? <span className="spinner" /> : <><LogIn size={16} /> Sign In</>}
          </button>

          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#64748b" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Create one →</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
