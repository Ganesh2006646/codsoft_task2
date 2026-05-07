import { Trash2, ArrowRight, Calendar, User, Edit2 } from "lucide-react";

const statusConfig = {
  "Todo":        { cls: "badge-todo",       next: "In Progress" },
  "In Progress": { cls: "badge-inprogress", next: "Done" },
  "Done":        { cls: "badge-done",       next: null },
};

const TaskCard = ({ task, onStatusChange, onDelete, onEdit }) => {
  const { _id, title, description, assignee, dueDate, status } = task;
  const cfg = statusConfig[status];
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "Done";
  const fmtDate = dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", marginBottom: "8px", transition: "box-shadow 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Top */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: status === "Done" ? "#94a3b8" : "#1e293b", textDecoration: status === "Done" ? "line-through" : "none", flex: 1, lineHeight: "1.4" }}>
          {title}
        </span>
        <span className={cfg.cls}>{status}</span>
      </div>

      {description && (
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", lineHeight: "1.5" }}>{description}</p>
      )}

      {/* Meta */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
        {assignee && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b" }}>
            <User size={11} /> {assignee}
          </span>
        )}
        {fmtDate && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: isOverdue ? "#ef4444" : "#64748b" }}>
            <Calendar size={11} /> {fmtDate}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
        {cfg.next ? (
          <button onClick={() => onStatusChange(_id, cfg.next)} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "500", padding: "0" }}>
            Move to {cfg.next} <ArrowRight size={12} />
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>✓ Completed</span>
        )}
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => onEdit(task)} style={{ padding: "4px", border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", borderRadius: "4px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#2563eb"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(_id)} style={{ padding: "4px", border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", borderRadius: "4px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
