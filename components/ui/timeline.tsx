import * as React from "react";

import { cn } from "@/lib/utils";

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="timeline"
      className={cn("relative space-y-0", className)}
      {...props}
    />
  );
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn("relative pl-8 last:pb-0", className)}
      {...props}
    />
  );
}

function TimelineSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-separator"
      className={cn(
        "absolute left-0 top-1 flex h-[calc(100%+0.5rem)] w-4 flex-col items-center",
        className,
      )}
      {...props}
    />
  );
}

function TimelineDot({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="timeline-dot"
      className={cn(
        "relative z-10 mt-1 block h-2.5 w-2.5 rounded-full bg-primary",
        className,
      )}
      {...props}
    />
  );
}

function TimelineConnector({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="timeline-connector"
      className={cn("mt-1 w-px flex-1 bg-border", className)}
      {...props}
    />
  );
}

function TimelineContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn("pb-4", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
};
