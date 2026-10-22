import { Suspense } from "react";
import { BusinessesPageView } from "@/components/app/businesses/businesses-page";

export default function BusinessesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <BusinessesPageView />
    </Suspense>
  );
}

function PageFallback() {
  return <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4" />;
}
