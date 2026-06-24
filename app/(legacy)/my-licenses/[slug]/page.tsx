import { redirect } from "next/navigation";

export default async function LegacyMyLicenseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/licenses/${encodeURIComponent(slug)}`);
}
