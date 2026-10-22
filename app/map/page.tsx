"use client";

import { Suspense } from "react";

export default function MapPage() {
  return (
    <main className="h-screen w-screen">
      <Suspense fallback={<div className="p-6">Loading map...</div>}>
        {/* <MapContainer canCreatePin /> */}
      </Suspense>
    </main>
  );
}
