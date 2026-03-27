import { Suspense } from "react";
import { EstablishmentPageView } from "@/components/back-office/establishment-page";

export default function EstablishmentPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <EstablishmentPageView />
    </Suspense>
  );
}

function PageFallback() {
  return <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4" />;
}
