import React from "react";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
      <div style={{ flex: 1, height: 20, background: "#ccc", marginRight: 10 }}>
        <div
          style={{
            width: progress + "%",
            height: "100%",
            background: "#0066cc",
            transition: "width .1s ease",
          }}
        />
      </div>
      <div style={{ minWidth: 40, textAlign: "right" }}>{progress}%</div>
    </div>
  );
}
