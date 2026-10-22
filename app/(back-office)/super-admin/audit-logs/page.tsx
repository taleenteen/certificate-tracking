import { AuditLogsTable } from '@/components/super-admin/audit-logs-table';

export const metadata = {
  title: 'Audit Log (ทั้งระบบ) | Super Admin',
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      <AuditLogsTable />
    </div>
  );
}
