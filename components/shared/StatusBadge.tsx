import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_BADGE_STYLES = {
  active: {
    label: "มีผลบังคับใช้",
    className: "border-transparent bg-emerald-100 text-emerald-900",
  },
  expiringSoon: {
    label: "ใกล้หมดอายุ",
    className: "border-transparent bg-amber-100 text-amber-900",
  },
  suspended: {
    label: "ถูกระงับ",
    className: "border-transparent bg-violet-200 text-violet-950",
  },
  expired: {
    label: "หมดอายุ",
    className: "border-transparent bg-rose-100 text-rose-900",
  },
} as const;

export type StatusBadgeStatus = keyof typeof STATUS_BADGE_STYLES;

type StatusBadgeProps = Omit<ComponentProps<typeof Badge>, "children"> & {
  status: StatusBadgeStatus;
  label?: string;
};

export function StatusBadge({
  status,
  label,
  className,
  variant,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_BADGE_STYLES[status];

  return (
    <Badge
      variant={variant ?? "outline"}
      className={cn(config.className, className)}
      {...props}
    >
      {label ?? config.label}
    </Badge>
  );
}

export const statusBadgeOptions = STATUS_BADGE_STYLES;
