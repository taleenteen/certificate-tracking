import { AdminAccountsTable } from '@/components/super-admin/admin-accounts-table';

export const metadata = {
  title: "จัดการผู้ใช้และสิทธิ์ | Super Admin",
};

export default function AdminAccountsPage() {
  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      <AdminAccountsTable />
    </div>
  );
}
