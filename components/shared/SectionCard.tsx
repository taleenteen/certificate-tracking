import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export function SectionCard({
  icon,
  title,
  children,
  headerAction,
  className,
  headerClassName,
  titleClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("mb-4 border border-gray-100 p-2", className)}>
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between",
          headerClassName,
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className={cn("text-lg font-bold", titleClassName)}>
            {title}
          </CardTitle>
        </div>
        {headerAction && (
          <div className="text-sm text-muted-foreground">{headerAction}</div>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-4 p-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
