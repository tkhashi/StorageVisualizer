import React, { useState } from "react";
import type { Node } from "../types";

interface FolderProps {
  node: Node;
  level: number;
  onClickFolder: (n: Node) => void;
}

function Folder({ node, level, onClickFolder }: FolderProps) {
  const [expanded, setExpanded] = useState(false);

  if (!node.isDir) {
    return (
      <div style={{ marginLeft: level * 16 }}>
        {node.name} ({node.size} bytes)
      </div>
    );
  }

  const handleClick = () => {
    onClickFolder(node);
    setExpanded((prev) => !prev);
  };

  return (
    <div style={{ marginLeft: level * 16 }}>
      <div style={{ cursor: "pointer", fontWeight: "bold" }} onClick={handleClick}>
        {node.name} ({node.size} bytes)
      </div>
      {expanded &&
        node.children?.map((child, i) => (
          <Folder key={i} node={child} level={level + 1} onClickFolder={onClickFolder} />
        ))}
    </div>
  );
}

interface FileTreeProps {
  node: Node;
  basePath: string;
  onClickFolder: (n: Node) => void;
}

export function FileTree({ node, basePath, onClickFolder }: FileTreeProps) {
  if (!node.isDir) {
    return (
      <div>
        {node.name} ({node.size} bytes)
      </div>
    );
  }

  return (
    <div
      style={{
        width: 300,
        height: 600,
        border: "1px solid #aaa",
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: "bold" }}>{basePath}</div>
      {node.children?.map((child, i) => (
        <Folder key={i} node={child} level={0} onClickFolder={onClickFolder} />
      ))}
    </div>
  );
}
