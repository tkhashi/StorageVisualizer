import React from "react";

interface HeaderProps {
  dirPath: string;
  onSelectDirectory: () => void;
  onScan: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function Header({ dirPath, onSelectDirectory, onScan, onBack, canGoBack }: HeaderProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ marginRight: 8 }}>Selected Path: {dirPath}</label>
      <button style={{ marginRight: 8 }} onClick={onSelectDirectory}>
        Select Directory
      </button>
      <button style={{ marginRight: 8 }} onClick={onScan}>Scan</button>
      {canGoBack && (
        <button onClick={onBack}>Back</button>
      )}
    </div>
  );
}
