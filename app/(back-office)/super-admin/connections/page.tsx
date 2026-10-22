import { ConnectionsDashboard } from '@/components/super-admin/connections-dashboard';

export const metadata = {
  title: 'การเชื่อมต่อระบบ & สถานะระบบ | Super Admin',
};

export default function ConnectionsPage() {
  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      <ConnectionsDashboard />
    </div>
  );
}
