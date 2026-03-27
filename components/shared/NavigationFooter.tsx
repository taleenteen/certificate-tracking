import type { ReactNode } from "react";

import Link from "next/link";
import { Map } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavigationFooterAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

type Props = {
  onNavigate?: () => void;
  actions?: NavigationFooterAction[];
  className?: string;
};

export function NavigationFooter({ onNavigate, actions, className }: Props) {
  const fallbackActions: NavigationFooterAction[] = [
    {
      label: "นำทาง",
      onClick: onNavigate,
      icon: <Map className="h-5 w-5" />,
      variant: "secondary",
    },
  ];

  const resolvedActions: NavigationFooterAction[] =
    actions && actions.length > 0
      ? actions
      : fallbackActions;

  return (
    <div
      className={cn(
        "border-t border-gray-100 bg-white/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/80",
        className,
      )}
    >
      <div
        className={cn(
          resolvedActions.length > 1 ? "grid grid-cols-2 gap-3" : "flex",
        )}
      >
        {resolvedActions.map((action) => {
          const buttonClassName = cn(
            "h-11 flex-1 rounded-xl text-sm font-medium shadow-none",
            action.variant === "primary"
              ? "bg-[#04302F] text-white hover:bg-[#0d403d]"
              : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
          );

          if (action.href) {
            return (
              <Button
                key={`${action.label}-${action.href}`}
                asChild
                type="button"
                className={buttonClassName}
              >
                <Link href={action.href}>
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            );
          }

          return (
            <Button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={buttonClassName}
            >
              {action.icon}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
