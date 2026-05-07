import { Link } from "react-router-dom";
import { Trash2, Calendar, CheckCircle2, ListTodo } from "lucide-react";

const ProjectCard = ({ project, onDelete, index = 0 }) => {
  const { _id, title, description, deadline, totalTasks = 0, completedTasks = 0 } = project;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isOverdue = deadline && new Date(deadline) < new Date();
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div className={`card fade-in delay-${(index % 4) + 1}`} style={{ padding: "22px", transition: "all 0.2s", cursor: "pointer" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
        <Link to={`/project/${_id}`} style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", textDecoration: "none", lineHeight: "1.3", flex: 1 }}
          onMouseEnter={e => e.target.style.color = "#2563eb"} onMouseLeave={e => e.target.style.color = "#1e293b"}>
          {title}
        </Link>
        <button onClick={() => onDelete(_id)} title="Delete" style={{ padding: "5px", border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", borderRadius: "6px", marginLeft: "8px" }}
          onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px", lineHeight: "1.5", minHeight: "38px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {description || "No description provided."}
      </p>

      {/* Progress */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Progress</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: progress === 100 ? "#16a34a" : "#2563eb" }}>{progress}%</span>
        </div>
        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "99px", width: `${progress}%`, background: progress === 100 ? "#22c55e" : "#2563eb", transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
            <ListTodo size={13} /> {totalTasks} tasks
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#16a34a" }}>
            <CheckCircle2 size={13} /> {completedTasks} done
          </span>
        </div>
        {formattedDeadline && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: isOverdue ? "#ef4444" : "#64748b" }}>
            <Calendar size={12} /> {formattedDeadline}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
