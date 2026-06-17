"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("@/components/map").then((mod) => mod.MapContainer),
  { ssr: false },
);

export default function MapPage() {
  return (
    <main className="h-screen w-screen">
      <Suspense fallback={<div className="p-6">Loading map...</div>}>
        {/* <MapContainer canCreatePin /> */}
      </Suspense>
    </main>
  );
}
