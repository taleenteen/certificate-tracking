"use client";

import dynamic from "next/dynamic";

const EMapPageView = dynamic(
  () =>
    import("@/components/app/map/e-map-page").then(
      (mod) => mod.EMapPageView,
    ),
  {
    ssr: false,
    loading: () => <div className="p-6">Loading map...</div>,
  },
);

export default function EMapPage() {
  return <EMapPageView />;
}
