import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <Progress value={progress} className="flex-1" />
      <div className="min-w-[40px] text-right text-sm text-muted-foreground">
        {progress}%
      </div>
    </div>
  );
}
