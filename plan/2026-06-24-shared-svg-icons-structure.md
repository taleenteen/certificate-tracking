# Shared SVG Icons Structure Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Establish a clean, best-practice structure for shared custom SVG icons in the project, starting by refactoring the hardcoded QR scanner button icon into a reusable React icon component.

## Context and constraints
- We already have a `components/icons/` folder containing:
  - [IconWrapper.tsx](file:///Users/mac/Frontend/certificate-tracking/components/icons/IconWrapper.tsx): SVG wrapper supporting customized size/color props.
  - [PinIcons.tsx](file:///Users/mac/Frontend/certificate-tracking/components/icons/PinIcons.tsx): Auto-generated map pins.
- To prevent map-specific Pin parameters (which default to `white` stroke color) from affecting general UI icons, any shared UI icon component should explicitly override default props or inherit `currentColor` appropriately.

---

## Proposed Changes

### 1. Create a Shared UI Icons File
Create a new file `components/icons/AppIcons.tsx` to hold general UI icons:
* **[NEW] [AppIcons.tsx](file:///Users/mac/Frontend/certificate-tracking/components/icons/AppIcons.tsx)**: Define and export `QrScannerIcon` wrapped inside `IconWrapper` with a default `color="currentColor"`.

```tsx
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
```

### 2. Refactor Codebases to import Shared Icon
* **[MODIFY] [home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx)**: Replace hardcoded QR scanner button SVG with `<QrScannerIcon size={22} />`.

---

## Validation checklist
- [x] Verify `AppIcons.tsx` is successfully created with correct typing imports.
- [x] Replace hardcoded SVG in `home-dashboard.tsx` with `<QrScannerIcon size={22} />`.
- [x] Run typescript checks (`bun x tsc --noEmit`) to verify clean type definitions.
- [x] Run project build compile validation (`bun run build`).

## Progress Log
- **2026-06-24**: Created `AppIcons.tsx` under `components/icons/` folder and imported existing `IconWrapper`.
- **2026-06-24**: Refactored `home-dashboard.tsx` to utilize `QrScannerIcon` instead of hardcoded SVG block. Passed TypeScript check and Next.js static build checks cleanly.
- **2026-06-24**: Resolved webcam stream release race condition in `qr-scanner-dialog.tsx` by awaiting the pending startup promise in `cleanupScanner()`. Fixed a subsequent `RenderedCameraImpl video surface onabort()` runtime error by removing direct DOM MediaStream track stopping, letting the awaited Promise sequence stop the scanner cleanly.

## Changed files
- [AppIcons.tsx](file:///Users/mac/Frontend/certificate-tracking/components/icons/AppIcons.tsx)
- [home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx)
- [qr-scanner-dialog.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/qr-scanner-dialog.tsx)
- [README.md](file:///Users/mac/Frontend/certificate-tracking/plan/README.md)
