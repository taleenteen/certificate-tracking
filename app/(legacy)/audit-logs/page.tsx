import { redirect } from "next/navigation";

export default function LegacyAuditLogsPage() {
  redirect("/super-admin/audit-logs");
}
