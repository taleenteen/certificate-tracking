import React from "react";
import { IconWrapper, IconProps } from "./IconWrapper";

export function QrScannerIcon({ color = "currentColor", ...props }: IconProps) {
  return (
    <IconWrapper color={color} {...props}>
      <path d="M3 8V5C3 3.89543 3.89543 3 5 3H8" strokeWidth={2} strokeLinecap="round" />
      <path d="M16 3H19C20.1046 3 21 3.89543 21 5V8" strokeWidth={2} strokeLinecap="round" />
      <path d="M21 16V19C21 20.1046 20.1046 21 19 21H16" strokeWidth={2} strokeLinecap="round" />
      <path d="M8 21H5C3.89543 21 3 20.1046 3 19V16" strokeWidth={2} strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth={2} strokeDasharray="3 3" />
    </IconWrapper>
  );
}
