"use client";

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PictogramIndicatorProps {
  hasPictograms: boolean;
  count?: number;
  className?: string;
}

export function PictogramIndicator({
  hasPictograms,
  count,
  className,
}: PictogramIndicatorProps) {
  if (!hasPictograms) {
    return (
      <ImageIcon className={cn("h-4 w-4 text-gray-300 dark:text-gray-600", className)} />
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <ImageIcon 
        className={cn(
          "h-4 w-4 text-blue-600 dark:text-blue-400",
          "drop-shadow-sm font-bold",
          className
        )}
        strokeWidth={hasPictograms ? 2.5 : 1.5}
      />
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}

