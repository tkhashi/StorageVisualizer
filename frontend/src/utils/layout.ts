import { Node, FileSizeInfo } from "../types";

export function insertPath(parent: Node, parts: string[], size: number, fullPath: string) {
  let current = parent;
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    if (isLast) {
      const fileNode: Node = {
        name: parts[i],
        path: fullPath,
        size,
        isDir: false,
      };
      current.children!.push(fileNode);
    } else {
      const dirName = parts[i];
      let subDir = current.children!.find((c) => c.name === dirName && c.isDir);
      if (!subDir) {
        subDir = {
          name: dirName,
          path: current.path ? `${current.path}/${dirName}` : dirName,
          size: 0,
          isDir: true,
          children: [],
        };
        current.children!.push(subDir);
      }
      current = subDir;
    }
  }
}

export function computeSizes(node: Node): number {
  if (!node.isDir) {
    return node.size;
  }
  let sum = 0;
  if (node.children) {
    for (const c of node.children) {
      sum += computeSizes(c);
    }
  }
  node.size = sum;
  return sum;
}

export function buildTree(fileSizes: FileSizeInfo[]): Node {
  const root: Node = {
    name: "root",
    path: "",
    size: 0,
    isDir: true,
    children: [],
  };

  // Sort files by path to ensure consistent ordering
  const sortedFiles = [...fileSizes].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    // Skip empty paths
    if (!file.path) continue;

    // Split path and filter out empty parts
    const parts = file.path.split("/").filter(part => part.length > 0);
    if (parts.length === 0) continue;

    insertPath(root, parts, file.size, file.path);
  }

  computeSizes(root);

  // Sort children by size for better visualization
  if (root.children) {
    root.children.sort((a, b) => b.size - a.size);
  }

  return root;
}

function getColor(baseColor: string, depth: number, index: number, isDir: boolean): string {
  // Convert base color to HSL for better control
  const baseInt = parseInt(baseColor.slice(1), 16);
  const r = (baseInt >> 16) & 255;
  const g = (baseInt >> 8) & 255;
  const b = baseInt & 255;

  // Convert RGB to HSL
  let h = 0, s = 0;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r / 255) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g / 255) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h /= 6;
  }

  // For files: small hue changes within the same folder
  // For directories: larger hue changes between folders
  if (isDir) {
    // Directories: Use depth to create more distinct colors between folders
    h = (depth * 0.35 + index * 0.05) % 1;
    s = 0.65;
    l = 0.4;
  } else {
    // Files: Use closer colors within the same folder
    h = (h + depth * 0.1 + index * 0.01) % 1;
    s = 0.7;
    l = 0.45;
  }

  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r2 = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const g2 = Math.round(hue2rgb(p, q, h) * 255);
  const b2 = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `#${(r2 << 16 | g2 << 8 | b2).toString(16).padStart(6, '0')}`;
}

function worst(row: Node[], width: number, totalArea: number): number {
  if (row.length === 0) return Infinity;
  
  const rowArea = row.reduce((sum, node) => sum + node.size, 0);
  const rowHeight = rowArea / width;
  let minWidth = Infinity;
  let maxWidth = 0;
  
  row.forEach(node => {
    const nodeWidth = (node.size / rowArea) * width;
    minWidth = Math.min(minWidth, nodeWidth);
    maxWidth = Math.max(maxWidth, nodeWidth);
  });
  
  return Math.max(
    (width * width * maxWidth) / (rowArea * rowArea),
    (rowArea * rowArea) / (width * width * minWidth)
  );
}

function layoutRow(row: Node[], x: number, y: number, width: number, height: number, depth: number) {
  let xOffset = x;
  const totalRowSize = row.reduce((sum, node) => sum + node.size, 0);
  
  row.forEach((node, i) => {
    const nodeWidth = (node.size / totalRowSize) * width;
    node.x = xOffset;
    node.y = y;
    node.width = nodeWidth;
    node.height = height;
    node.color = getColor("#3498db", depth, i / row.length, node.isDir);
    
    if (node.children && node.children.length > 0) {
      layoutPivotAndSlice(node, xOffset, y, nodeWidth, height, depth + 1);
    }
    
    xOffset += nodeWidth;
  });
}

export function layoutPivotAndSlice(
  node: Node,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number = 0
) {
  // Ensure valid dimensions
  if (width <= 0 || height <= 0) {
    console.warn('Invalid dimensions:', width, height);
    return;
  }

  // Set node dimensions
  node.x = x;
  node.y = y;
  node.width = width;
  node.height = height;
  node.color = getColor("#3498db", depth, 0, node.isDir);

  // If leaf node or no children, return early
  if (!node.isDir || !node.children || node.children.length === 0) {
    return;
  }

  const validChildren = node.children.filter(child => child.size > 0);
  if (validChildren.length === 0) return;

  const totalSize = validChildren.reduce((sum, child) => sum + child.size, 0);
  if (totalSize === 0) return;

  // Sort by size (largest first)
  validChildren.sort((a, b) => b.size - a.size);

  // Layout using squarified algorithm
  let currentRow: Node[] = [];
  let currentY = y;
  let remainingHeight = height;
  let i = 0;

  while (i < validChildren.length) {
    const child = validChildren[i];
    const newRow = [...currentRow, child];
    
    if (currentRow.length === 0 || 
        worst(newRow, width, totalSize) <= worst(currentRow, width, totalSize)) {
      currentRow.push(child);
      i++;
    } else {
      // Layout current row
      const rowSize = currentRow.reduce((sum, node) => sum + node.size, 0);
      const rowHeight = (rowSize / totalSize) * height;
      layoutRow(currentRow, x, currentY, width, rowHeight, depth + 1);
      
      // Reset for next row
      currentY += rowHeight;
      remainingHeight -= rowHeight;
      currentRow = [];
    }
  }

  // Layout last row if any
  if (currentRow.length > 0) {
    layoutRow(currentRow, x, currentY, width, remainingHeight, depth + 1);
  }
}
