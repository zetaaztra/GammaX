import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
}

export function RefreshButton({ isLoading = false, onClick, className }: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="default"
      onClick={onClick}
      disabled={isLoading}
      className={cn("gap-2", className)}
      data-testid="button-refresh"
      aria-label="Refresh data"
    >
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}
