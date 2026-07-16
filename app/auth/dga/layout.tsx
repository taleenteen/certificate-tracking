import type { ReactNode } from "react";
import Script from "next/script";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function DgaLandingLayout({ children }: { children: ReactNode }) {
  const usesMToken = process.env.NEXT_PUBLIC_DGA_AUTH_FLOW !== "oidc";

  return (
    <>
      {usesMToken && (
        <Script
          src="https://czp.dga.or.th/cportal/sdk/iu/v4/sdk.js"
          strategy="beforeInteractive"
        />
      )}
      {children}
    </>
  );
}
