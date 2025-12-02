import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import type { DataQuality } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DataQualityBadgeProps {
  quality: DataQuality;
  className?: string;
}

export function DataQualityBadge({ quality, className }: DataQualityBadgeProps) {
  const config = {
    GOOD: {
      icon: CheckCircle,
      label: "GOOD",
      variant: "default" as const,
      className: "bg-success/20 text-success border-success/30 hover:bg-success/30",
    },
    LOW: {
      icon: AlertTriangle,
      label: "LOW",
      variant: "secondary" as const,
      className: "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
    },
    INSUFFICIENT: {
      icon: AlertCircle,
      label: "INSUFFICIENT",
      variant: "destructive" as const,
      className: "bg-danger/20 text-danger border-danger/30 hover:bg-danger/30",
    },
  };

  const { icon: Icon, label, className: badgeClass } = config[quality];

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1 text-xs font-medium", badgeClass, className)}
      data-testid={`badge-quality-${quality.toLowerCase()}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
