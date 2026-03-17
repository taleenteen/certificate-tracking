import { cn } from "@/lib/utils";
import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function IconWrapper({
  children,
  className,
  size = 24,
  color,
  style,
  ...props
}: IconProps) {
  // Use explicit color prop or inline style color, falling back to "white".
  // This ensures icons render white when converted to static markup
  // for Mapbox canvas pins (where "currentColor" resolves to black).
  const strokeColor = color || style?.color || "white";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor as string}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      style={{ ...style, color: strokeColor as string }}
      {...props}
    >
      {children}
    </svg>
  );
}
