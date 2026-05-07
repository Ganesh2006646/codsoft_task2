import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FolderPlus, LogOut, Menu, X, Boxes, ShieldAlert } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (p) => location.pathname === p;

  let links = [];
  
  if (user?.role === "admin") {
    links.push({ to: "/admin", label: "Admin Panel", icon: ShieldAlert });
  } else if (user?.role === "head") {
    links.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    links.push({ to: "/create-project", label: "New Project", icon: FolderPlus });
  } else {
    // Regular users — no project creation
    links.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  }

  const navStyle = {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky", top: 0, zIndex: 50,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  };
  const innerStyle = { maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ background: "#2563eb", borderRadius: "10px", padding: "7px", display: "flex" }}>
            <Boxes size={18} color="#fff" />
          </div>
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#1e293b" }}>ProjectHub</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px", textDecoration: "none",
              fontSize: "14px", fontWeight: "500", transition: "all 0.15s",
              background: isActive(to) ? "#eff6ff" : "transparent",
              color: isActive(to) ? "#2563eb" : "#64748b",
            }}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="desktop-nav">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ display: "none", padding: "6px", border: "none", background: "transparent", cursor: "pointer", color: "#64748b" }} className="mobile-toggle">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 24px" }}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
              borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "500",
              color: isActive(to) ? "#2563eb" : "#64748b",
              background: isActive(to) ? "#eff6ff" : "transparent", marginBottom: "4px",
            }}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "8px" }}>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "8px", border: "none", background: "transparent", color: "#ef4444", fontSize: "14px", cursor: "pointer", width: "100%" }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
