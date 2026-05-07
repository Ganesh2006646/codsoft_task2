import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { UserPlus, Mail, Lock, User, Boxes } from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", form);
      login(data.user, data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #dbeafe 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div className="fade-in" style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", padding: "14px", borderRadius: "16px", background: "#2563eb", marginBottom: "16px", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
            <Boxes size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" }}>Create Account</h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>Start managing your projects today</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card fade-in delay-1" style={{ padding: "32px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label className="label">Full Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input type="text" name="name" value={form.name} onChange={handle} required placeholder="John Doe" className="input-field" />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input type="email" name="email" value={form.email} onChange={handle} required placeholder="you@example.com" className="input-field" />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input type="password" name="password" value={form.password} onChange={handle} required minLength={6} placeholder="Min. 6 characters" className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Create Account</>}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Sign in →</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
