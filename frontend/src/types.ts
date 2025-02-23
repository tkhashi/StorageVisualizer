export interface FileSizeInfo {
  path: string;
  size: number;
}

export interface Node {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  children?: Node[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface HoverInfo {
  node: Node;
  x: number;
  y: number;
}

export interface ViewState {
  basePath: string;
  rootNode: Node;
  history: {
    basePath: string;
    rootNode: Node;
  }[];
}
