import { redirect } from "next/navigation";

export default function LegacyAdminAccountsPage() {
  redirect("/super-admin/admin-accounts");
}
