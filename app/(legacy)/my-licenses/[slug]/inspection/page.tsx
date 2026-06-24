import { redirect } from "next/navigation";

export default async function LegacyMyLicenseInspectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/inspection-tasks/${encodeURIComponent(slug)}`);
}
