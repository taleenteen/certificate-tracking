import { StatCard } from '@/components/super-admin/stat-card';
import { AgencySummaryTable } from '@/components/super-admin/agency-summary-table';
import { SystemAlertList } from '@/components/super-admin/system-alert-list';
import { TrendChart } from '@/components/super-admin/trend-chart';
import { Building2, UserCog, Users, FileText } from 'lucide-react';

export const metadata = {
  title: "แดชบอร์ดระบบ | Super Admin",
};

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <StatCard 
          icon={Building2}
          title="จำนวนหน่วยงานทั้งหมด"
          subTitle="หน่วยงานที่เชื่อมต่อระบบ"
          value="5"
          iconBgClass="bg-[#dbeafe]"
          iconTextClass="text-blue-600"
        />
        <StatCard 
          icon={UserCog}
          title="จำนวนบัญชี Admin"
          subTitle="ตัวแทนหน่วยงานทั้งหมด"
          value="14"
          change="2 ใหม่"
          iconBgClass="bg-[#f3e8ff]"
          iconTextClass="text-purple-600"
        />
        <StatCard 
          icon={Users}
          title="จำนวนเจ้าหน้าที่ทั้งหมด"
          subTitle="ทุกหน่วยงานรวมกัน"
          value="59"
          change="12.3%"
          iconBgClass="bg-[#fef3c6]"
          iconTextClass="text-amber-600"
        />
        <StatCard 
          icon={FileText}
          title="จำนวนใบอนุญาตทั้งหมด"
          subTitle="ครอบคลุม 5 ประเภท"
          value="8,570"
          change="5.2%"
          iconBgClass="bg-[#d0fae5]"
          iconTextClass="text-emerald-600"
        />
      </div>

      {/* Middle Section - Table */}
      <div className="w-full">
        <AgencySummaryTable />
      </div>

      {/* Bottom Section - Chart & Notifications */}
      <div className="flex gap-[12px] flex-col lg:flex-row items-stretch">
        <div className="lg:w-[835px] shrink-0">
          <TrendChart />
        </div>
        <div className="flex-1 min-w-[300px]">
          <SystemAlertList />
        </div>
      </div>
    </div>
  );
}
