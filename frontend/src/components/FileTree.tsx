import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import type { Node } from "../types";
import { formatSize } from "../utils";

interface FolderProps {
  node: Node;
  level: number;
  onClickFolder: (n: Node) => void;
}

function FolderItem({ node, level, onClickFolder }: FolderProps) {
  const [expanded, setExpanded] = useState(false);

  if (!node.isDir) {
    return (
      <div className={`flex items-center py-1 px-2 hover:bg-accent/50 ml-${level * 4}`}>
        <File className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm">
          {node.name} ({formatSize(node.size)})
        </span>
      </div>
    );
  }

  const handleClick = () => {
    onClickFolder(node);
    setExpanded((prev) => !prev);
  };

  return (
    <div className={`ml-${level * 4}`}>
      <div
        className="flex items-center py-1 px-2 hover:bg-accent/50 cursor-pointer"
        onClick={handleClick}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 mr-1" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1" />
        )}
        <Folder className="h-4 w-4 mr-2 text-blue-500" />
        <span className="text-sm font-medium">
          {node.name} ({formatSize(node.size)})
        </span>
      </div>
      {expanded && node.children?.map((child, i) => (
        <FolderItem key={i} node={child} level={level + 1} onClickFolder={onClickFolder} />
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
  return (
    <div className="w-[300px] h-[600px] border rounded-lg overflow-y-auto bg-card">
      <div className="p-2 border-b font-medium text-sm">{basePath}</div>
      <div className="p-2">
        {node.children?.map((child, i) => (
          <FolderItem key={i} node={child} level={0} onClickFolder={onClickFolder} />
        ))}
      </div>
    </div>
  );
}
