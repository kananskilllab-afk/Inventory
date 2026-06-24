import { useState } from "react";
import Icon from "./Icon";

export default function Input({ label, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = props.type === "password";

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "var(--text-muted)", position: "relative" }}>
      {label}
      <div style={{ position: "relative", width: "100%" }}>
        <input
          {...props}
          type={isPassword ? (visible ? "text" : "password") : props.type}
          style={{
            padding: "9px 13px",
            paddingRight: isPassword ? "40px" : "13px",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontFamily: "inherit",
            background: "var(--surface)",
            color: "var(--text)",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            transition: "border var(--transition), box-shadow var(--transition)",
            ...(props.style || {}),
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <Icon d={visible ? "eye-off" : "eye"} size={16} />
          </button>
        )}
      </div>
    </label>
  );
}
