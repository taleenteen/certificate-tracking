import { notFound } from "next/navigation";

import { getMockLicenseDetail } from "@/components/back-office/license-data";
import { LicenseInspectionPageView } from "@/components/back-office/license-inspection-page";

export default async function MyLicenseInspectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getMockLicenseDetail(slug);

  if (!data) {
    notFound();
  }

  return <LicenseInspectionPageView data={data} />;
}
