import type { ReactNode } from "react";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function DgaLandingLayout({ children }: { children: ReactNode }) {
  return children;
}
