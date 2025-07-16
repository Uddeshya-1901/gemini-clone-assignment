import React from "react";
import { cn } from "../../utils";

const LoadingSpinner = ({ size = "default", className }) => {
  const sizes = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-primary-500",
        sizes[size],
        className
      )}
    />
  );
};

const LoadingSkeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
};

const MessageSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`flex items-end space-x-2 ${
              i % 2 === 0 ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <LoadingSkeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <LoadingSkeleton className="h-4 w-40" />
              <LoadingSkeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { LoadingSpinner, LoadingSkeleton, MessageSkeleton };
