import { MasterDataTable } from '@/components/super-admin/master-data-table';

export const metadata = {
  title: 'หน่วยงาน & ข้อมูลหลัก | Super Admin',
};

export default function AgenciesPage() {
  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      <MasterDataTable />
    </div>
  );
}
