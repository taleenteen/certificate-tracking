import { notFound } from "next/navigation";

import {
  LicenseDetailPageView,
} from "@/components/back-office/license-detail-page";
import { getMockLicenseDetail } from "@/components/back-office/license-data";

export default async function MyLicenseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getMockLicenseDetail(slug);

  if (!data) {
    notFound();
  }

  return <LicenseDetailPageView data={data} />;
}
