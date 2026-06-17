'use client';

import { StatCard } from '@/components/super-admin/stat-card';
import { AgencySummaryTable } from '@/components/super-admin/agency-summary-table';
import { SystemAlertList } from '@/components/super-admin/system-alert-list';
import { TrendChart } from '@/components/super-admin/trend-chart';
import { Building2, UserCog, Users, FileText } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAgencies } from '@/hooks/useAgencies';

export default function SuperAdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const { data: agencies = [] } = useAgencies();

  const adminCount = data ? (data.userCounts['admin'] ?? 0) : 0;
  const staffCount = data
    ? (data.userCounts['inspector'] ?? 0) + (data.userCounts['supervisor'] ?? 0)
    : 0;
  const licenseTotal = data
    ? Object.values(data.licenseCounts).reduce((s, v) => s + v, 0)
    : 0;
  const agencyCount = agencies.length;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <p className="text-[13px] text-placeholder">โหลดข้อมูลแดชบอร์ดไม่สำเร็จ</p>
        <button
          onClick={() => refetch()}
          className="text-[13px] font-semibold text-brand-primary hover:underline"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-[16px] animate-in fade-in duration-500 max-w-[1259.2px]">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <StatCard
          icon={Building2}
          title="จำนวนหน่วยงานทั้งหมด"
          subTitle="หน่วยงานที่เชื่อมต่อระบบ"
          value={isLoading ? '…' : String(agencyCount)}
          iconBgClass="bg-[#dbeafe]"
          iconTextClass="text-blue-600"
        />
        <StatCard
          icon={UserCog}
          title="จำนวนบัญชี Admin"
          subTitle="ตัวแทนหน่วยงานทั้งหมด"
          value={isLoading ? '…' : String(adminCount)}
          iconBgClass="bg-[#f3e8ff]"
          iconTextClass="text-purple-600"
        />
        <StatCard
          icon={Users}
          title="จำนวนเจ้าหน้าที่ทั้งหมด"
          subTitle="ผู้ตรวจ + ผู้บังคับบัญชา"
          value={isLoading ? '…' : String(staffCount)}
          iconBgClass="bg-[#fef3c6]"
          iconTextClass="text-amber-600"
        />
        <StatCard
          icon={FileText}
          title="จำนวนใบอนุญาตทั้งหมด"
          subTitle="ทุกสถานะรวมกัน"
          value={isLoading ? '…' : licenseTotal.toLocaleString('th-TH')}
          iconBgClass="bg-[#d0fae5]"
          iconTextClass="text-emerald-600"
        />
      </div>

      {/* Agency Summary — MOCK: replace with live per-agency breakdown in UAT */}
      <div className="w-full">
        <AgencySummaryTable />
      </div>

      {/* Chart & Alerts — MOCK: telemetry endpoints not available in v1 */}
      <div className="flex gap-[12px] flex-col lg:flex-row items-stretch">
        <div className="lg:w-[835px] shrink-0">
          {/* MOCK: replace with GET /api/system/metrics/hourly in UAT */}
          <TrendChart />
        </div>
        <div className="flex-1 min-w-[300px]">
          {/* MOCK: replace with GET /api/system/alerts in UAT */}
          <SystemAlertList />
        </div>
      </div>
    </div>
  );
}
