import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen, Search } from "lucide-react";

interface HeaderProps {
  dirPath: string;
  onSelectDirectory: () => void;
  onScan: () => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function Header({ dirPath, onSelectDirectory, onScan, onBack, canGoBack }: HeaderProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="flex items-center gap-2">
        {canGoBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" onClick={onSelectDirectory}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Select Directory
        </Button>
        <Button onClick={onScan}>
          <Search className="h-4 w-4 mr-2" />
          Scan
        </Button>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        Selected Path: {dirPath}
      </div>
    </div>
  );
}
