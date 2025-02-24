import React, { useRef, useEffect, useState } from "react";
import { Node, HoverInfo } from "../types";
import { formatSize } from "../utils";
import { Card } from "@/components/ui/card";

interface TreemapProps {
  node: Node;
  rootSize?: number;
  onHover: (node: Node, x: number, y: number) => void;
  onLeave: () => void;
}

function Treemap({ node, rootSize, onHover, onLeave }: TreemapProps) {
  const totalSize = rootSize || node.size;
  // For root node, only render children
  if (node.name === "root") {
    return (
      <>
        {node.children?.map((child, index) => (
          <Treemap key={index} node={child} rootSize={node.size} onHover={onHover} onLeave={onLeave} />
        ))}
      </>
    );
  }

  // Skip nodes without dimensions
  if (
    node.x === undefined ||
    node.y === undefined ||
    node.width === undefined ||
    node.height === undefined
  ) {
    return null;
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    backgroundColor: node.color,
    border: "1px solid #fff",
    boxSizing: "border-box",
    overflow: "hidden",
    cursor: "pointer",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onHover(node, e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    onLeave();
  };

  return (
    <>
      <div style={style} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {node.width > 50 && node.height > 30 && !node.isDir && (
          <div
            style={{
              color: "#fff",
              fontSize: "12px",
              padding: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {node.name} ({formatSize(node.size)} - {((node.size / totalSize) * 100).toFixed(1)}%)
          </div>
        )}
      </div>
      {node.children?.map((child, index) => (
        <Treemap key={index} node={child} rootSize={totalSize} onHover={onHover} onLeave={onLeave} />
      ))}
    </>
  );
}

interface TooltipProps {
  hoverInfo: HoverInfo;
  rootSize: number;
}

function Tooltip({ hoverInfo, rootSize }: TooltipProps) {
  return (
    <Card className="fixed z-50 p-3 bg-popover text-popover-foreground shadow-lg rounded-lg max-w-[300px]" 
      style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}>
      <div className="space-y-1 text-sm">
        <div>Name: {hoverInfo.node.name}</div>
        <div className="text-muted-foreground text-xs">{hoverInfo.node.path}</div>
        <div>
          Size: {formatSize(hoverInfo.node.size)} 
          ({((hoverInfo.node.size / (rootSize || hoverInfo.node.size)) * 100).toFixed(1)}%)
        </div>
      </div>
    </Card>
  );
}

interface VisualizationProps {
  node: Node;
  onSizeChange: (width: number, height: number) => void;
}

export function Visualization({ node, onSizeChange }: VisualizationProps) {
  const [hovered, setHovered] = useState<HoverInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial size measurement
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          onSizeChange(rect.width, rect.height);
        }
      }
    }, 100); // Wait for container to be properly rendered
    return () => clearTimeout(timer);
  }, []);

  // Size updates on resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          onSizeChange(width, height);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [onSizeChange]);

  const handleHover = (node: Node, x: number, y: number) => {
    setHovered({ node, x, y });
  };

  const handleLeave = () => {
    setHovered(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-[400px] min-h-[600px] h-[600px] ml-4 border rounded-lg overflow-hidden"
    >
      <Treemap node={node} rootSize={node.size} onHover={handleHover} onLeave={handleLeave} />
      {hovered && <Tooltip hoverInfo={hovered} rootSize={node.size} />}
    </div>
  );
}
