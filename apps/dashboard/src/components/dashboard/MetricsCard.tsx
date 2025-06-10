import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}

export function MetricsCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = change !== undefined
    ? change > 0
      ? "up"
      : change < 0
      ? "down"
      : "neutral"
    : "neutral",
  isLoading = false,
}: MetricsCardProps) {
  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    const sign = change > 0 ? "+" : change < 0 ? "-" : "";
    return `${sign}${absChange}%`;
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "down":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  if (isLoading) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {change !== undefined && (
            <Badge
              variant="secondary"
              className={cn("text-xs", getTrendColor(trend))}
            >
              {formatChange(change)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
