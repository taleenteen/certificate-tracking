"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface AppBreadcrumbProps {
  items: BreadcrumbItemType[];
  className?: string;
  variant?: "light" | "dark"; // "light" for white text on dark bg, "dark" for dark text on light bg
}

export function AppBreadcrumb({ items, className, variant = "light" }: AppBreadcrumbProps) {
  const isDark = variant === "dark";

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={cn(
        "text-[12px] font-semibold sm:gap-1.5 flex-wrap items-center",
        isDark ? "text-slate-400" : "text-white/60"
      )}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className={cn(
                    "font-semibold",
                    isDark ? "text-slate-700" : "text-white"
                  )}>
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className={cn(
                    "transition-colors cursor-pointer",
                    isDark ? "text-slate-400 hover:text-slate-700" : "text-white/60 hover:text-white"
                  )}>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className={cn(
                  "[&>svg]:size-3",
                  isDark ? "text-slate-300" : "text-white/30"
                )} />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
