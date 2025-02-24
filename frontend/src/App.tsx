import { useState, useCallback } from "react";
import { SelectDirectory, GetFileSizes } from "../wailsjs/go/main/App";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { FileTree } from "./components/FileTree";
import { Visualization } from "./components/Visualization";
import { buildTree, layoutPivotAndSlice } from "./utils/layout";
import { ViewState, Node, FileSizeInfo } from "./types";

function App() {
  const [dirPath, setDirPath] = useState("");
  const [history, setHistory] = useState<ViewState[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleSizeChange = useCallback((width: number, height: number) => {
    setContainerSize({ width, height });
    
    if (history.length > 0) {
      const lastView = history[history.length - 1];
      const root = buildTree(lastView.rootNode.children?.map(child => ({
        path: child.path,
        size: child.size
      })) || []);
      layoutPivotAndSlice(root, 0, 0, width, height);
      setHistory(prev => [
        ...prev.slice(0, -1),
        { basePath: lastView.basePath, rootNode: root, history: lastView.history }
      ]);
    }
  }, [history]);

  async function handleSelectDirectory() {
    try {
      const selected = await SelectDirectory();
      if (selected && selected.trim() !== "") {
        setDirPath(selected);
        setError("");
        setProgress(0);
        setHistory([]); // Clear history
        setContainerSize({ width: 0, height: 0 }); // Reset container size
      }
    } catch (err: any) {
      console.error("SelectDirectory error:", err);
      setError("Failed to select directory");
    }
  }

  async function handleScan() {
    if (!dirPath || dirPath.trim() === "") {
      setError("Please select a directory first");
      return;
    }
    
    setError("");
    setProgress(0);
    setHistory([]); // Clear previous scan results

    try {
      // Start scanning
      setProgress(10);
      const files = await GetFileSizes(dirPath);
      
      // Check response
      if (!files || !Array.isArray(files) || files.length === 0) {
        setError("No files found in the selected directory");
        setProgress(0);
        return;
      }

      // Process files
      setProgress(50);
      const root = buildTree(files);
      
      // Layout visualization
      setProgress(80);
      if (containerSize.width > 0 && containerSize.height > 0) {
        layoutPivotAndSlice(root, 0, 0, containerSize.width, containerSize.height);
      }
      
      // Update state
      setProgress(100);
      setHistory([{ basePath: dirPath, rootNode: root, history: [] }]);
    } catch (err: any) {
      console.error("GetFileSizes error:", err);
      setError(err.message || "Failed to scan directory");
      setProgress(0);
    }
  }

  function handleBack() {
    if (history.length > 1) {
      // 最後のビューを取得
      const lastView = history[history.length - 1];
      // 前のビューに戻る（最後のビューの履歴から復元）
      if (lastView.history.length > 0) {
        const previousView = lastView.history[lastView.history.length - 1];
        setHistory(prev => [...prev.slice(0, -1), {
          ...previousView,
          history: lastView.history.slice(0, -1)
        }]);
      } else {
        // 通常の戻る処理
        setHistory(prev => prev.slice(0, prev.length - 1));
      }
    }
  }

  function handleClickFolder(folder: Node) {
    // フォルダークリック時の処理（必要に応じて実装）
  }

  const currentView = history.length > 0 ? history[history.length - 1] : null;
  const rootNode = currentView?.rootNode;
  const basePath = currentView?.basePath || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        dirPath={dirPath}
        onSelectDirectory={handleSelectDirectory}
        onScan={handleScan}
        onBack={handleBack}
        canGoBack={history.length > 1}
      />
      <ProgressBar progress={progress} />
      {error && (
        <div className="p-4 text-sm text-destructive">{error}</div>
      )}
      <div className="flex p-4 gap-4">
        {rootNode && (
          <FileTree
            node={rootNode}
            basePath={basePath}
            onClickFolder={handleClickFolder}
          />
        )}
        {rootNode && (
          <Visualization
            node={rootNode}
            onSizeChange={handleSizeChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;
