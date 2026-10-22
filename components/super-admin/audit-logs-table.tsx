'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuditLogs, exportAuditLogsCsv, type AuditLogFilters } from '@/hooks/useAuditLogs';
import { useAgencies } from '@/hooks/useAgencies';

const ENTITY_TYPES = [
  'User',
  'License',
  'InspectionTask',
  'Zone',
  'LicenseType',
  'SyncLog',
];

const roleLabel = (roles: string[]) => {
  if (roles.includes('super_admin')) return 'Super Admin';
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('supervisor')) return 'Supervisor';
  if (roles.includes('inspector')) return 'Inspector';
  return roles.join(', ');
};

const formatValue = (val: Record<string, unknown> | null): string => {
  if (!val) return '——';
  const entries = Object.entries(val)
    .filter(([k]) => !['id', 'updatedAt', 'createdAt'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  return entries.length > 80 ? entries.slice(0, 80) + '…' : entries || '——';
};

export function AuditLogsTable() {
  const [q, setQ] = React.useState('');
  const [entityType, setEntityType] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  const filters: AuditLogFilters = {
    q: q || undefined,
    entityType: entityType || undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const { data: logsPage, isLoading, isError, refetch } = useAuditLogs(filters);
  const logs = logsPage?.data ?? [];
  const { data: agencies = [] } = useAgencies();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      dateStyle: 'short',
      timeStyle: 'short',
    });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
        <p className="text-[13px] text-placeholder">โหลดข้อมูลไม่สำเร็จ</p>
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
    <div className="space-y-[16px]">
      {/* Filters & Export Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-gray-200 shadow-smooth-low">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          {/* User / keyword search */}
          <Input
            placeholder="ค้นหาผู้ใช้งาน / คำสำคัญ"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-[200px] border-gray-200 text-[13px] h-9"
          />

          {/* EntityType filter */}
          <Select value={entityType || 'ALL'} onValueChange={(v) => setEntityType(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-200 text-[13px] h-9">
              <SelectValue placeholder="ประเภทรายการทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ประเภทรายการทั้งหมด</SelectItem>
              {ENTITY_TYPES.map((et) => (
                <SelectItem key={et} value={et}>{et}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range: from */}
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full sm:w-[160px] border-gray-200 text-[13px] h-9"
            title="วันที่เริ่มต้น"
          />

          {/* Date range: to */}
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full sm:w-[160px] border-gray-200 text-[13px] h-9"
            title="วันที่สิ้นสุด"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => exportAuditLogsCsv(filters)}
          className="border-gray-200 text-main hover:bg-fuji-light rounded-square px-4 py-1.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9 cursor-pointer"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Main Table */}
      <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1060px]">
            <thead>
              <tr className="bg-fuji-light/30 border-b border-gray-200">
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[155px]">วันที่-เวลา</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[100px]">หน่วยงาน</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[180px]">ผู้ใช้งาน</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">ประเภทรายการ / ID</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">การกระทำ</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder">ค่าเดิม → ค่าใหม่</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">
                    <RefreshCw className="animate-spin size-4 inline-block mr-2" />
                    กำลังโหลด...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">
                    ไม่พบข้อมูล Audit Log
                  </td>
                </tr>
              ) : (
                logs.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[12px] text-placeholder font-medium font-mono whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      {row.user?.agencyId ? (
                        <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                          {agencies.find((a) => a.id === row.user!.agencyId)?.code ?? row.user.agencyId.slice(0, 8)}
                        </span>
                      ) : <span className="text-placeholder text-[12px]">—</span>}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <p className="text-[13px] text-main font-semibold leading-tight">
                        {row.user?.fullName ?? '—'}
                      </p>
                      {row.user?.roles && (
                        <p className="text-[11px] text-placeholder font-medium mt-0.5">
                          {roleLabel(row.user.roles)}
                        </p>
                      )}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <p className="text-[12px] font-bold text-main">{row.entityType}</p>
                      {row.entityId && (
                        <p className="text-[10px] text-placeholder font-mono mt-0.5 truncate max-w-[140px]">
                          {row.entityId}
                        </p>
                      )}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-bold">{row.action}</td>
                    <td className="px-[16px] py-[12px] text-[12px]">
                      <div className="flex items-start gap-2 font-mono">
                        <span className="text-[#cf1322] break-all leading-relaxed">
                          {formatValue(row.beforeValue)}
                        </span>
                        <ArrowRight className="size-3 text-placeholder shrink-0 mt-1" />
                        <span className="text-[#007a55] break-all leading-relaxed">
                          {formatValue(row.afterValue)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-[#f0f9eb]/40 border border-[#b2e2a2]/40 rounded-[12px] p-[16px] text-left">
        <h4 className="text-[13px] font-bold text-[#4a9b72] mb-1.5">Audit Log รวมทุกหน่วยงาน</h4>
        <ul className="list-disc pl-5 text-[12px] text-[#4a5565] space-y-1">
          <li><strong>สิทธิ์ Super Admin:</strong> เรียกดูประวัติทุกหน่วยงาน รวมถึงการสร้าง/แก้ไขบัญชี Admin และการปรับสิทธิ์</li>
          <li><strong>citizenId:</strong> ไม่แสดงในบันทึก (ระบบปกป้องข้อมูลส่วนบุคคล)</li>
          <li><strong>Export CSV:</strong> ดาวน์โหลดตามตัวกรองที่เลือก สามารถเปิดด้วย Excel (รองรับภาษาไทย)</li>
        </ul>
      </div>
    </div>
  );
}
