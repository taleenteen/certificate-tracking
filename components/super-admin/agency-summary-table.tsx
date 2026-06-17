'use client';

import { Card } from '@/components/ui/card';
import { RefreshCw, FlaskConical } from 'lucide-react';
import { useAgencies } from '@/hooks/useAgencies';

function MockBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
      <FlaskConical className="size-3" />
      ข้อมูลจำลอง
    </span>
  );
}

function statusChip(isActive: boolean, apiStatus: string) {
  if (!isActive) return { label: 'ไม่ใช้งาน', bg: 'bg-[#f3f4f6]', text: 'text-[#4a5565]' };
  if (apiStatus === 'DISCONNECTED') return { label: 'ผิดปกติ', bg: 'bg-[#ffe2e2]', text: 'text-[#c10007]' };
  return { label: 'ปกติ', bg: 'bg-[#d0fae5]', text: 'text-[#007a55]' };
}

export function AgencySummaryTable() {
  const { data: agencies = [], isLoading, isError, refetch } = useAgencies();

  return (
    <div className="w-full space-y-[12px]">
      <h2 className="text-[14px] font-semibold text-[#1c2b3a] leading-[20px]">
        สรุปข้อมูลต่อหน่วยงาน
      </h2>

      <Card className="rounded-[12px] border-[#e5e7eb] border-[0.8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[200px]">หน่วยงาน</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[160px]">
                  ประเภทใบอนุญาต
                </th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[140px]">
                  <div className="flex items-center justify-center gap-1">จำนวน Admin <MockBadge /></div>
                </th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[140px]">
                  <div className="flex items-center justify-center gap-1">จำนวนเจ้าหน้าที่ <MockBadge /></div>
                </th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[140px]">
                  <div className="flex items-center justify-center gap-1">จำนวนใบอนุญาต <MockBadge /></div>
                </th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[120px]">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-[12px] py-[32px] text-center text-[12px] text-[#4a5565]">
                    <RefreshCw className="animate-spin size-4 inline-block mr-2" />
                    กำลังโหลด...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-[12px] py-[20px] text-center text-[12px] text-[#4a5565]">
                    โหลดข้อมูลไม่สำเร็จ{' '}
                    <button onClick={() => refetch()} className="text-brand-primary font-semibold hover:underline">
                      ลองใหม่
                    </button>
                  </td>
                </tr>
              ) : agencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-[12px] py-[20px] text-center text-[12px] text-[#4a5565]">
                    ไม่พบข้อมูลหน่วยงาน
                  </td>
                </tr>
              ) : (
                agencies.map((agency) => {
                  const chip = statusChip(agency.isActive, agency.apiStatus);
                  return (
                    <tr key={agency.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-[12px] py-[10px] border-b-[0.8px] border-[#f3f4f6]">
                        <div className="flex items-center gap-[4px]">
                          <span className="text-[12px] font-bold text-[#4a9b72] font-mono leading-[16px]">{agency.code}</span>
                          <span className="text-[12px] text-[#7a8fa6] font-normal leading-[16px]">{agency.nameTh}</span>
                        </div>
                      </td>
                      <td className="px-[12px] py-[8px] border-b-[0.8px] border-[#f3f4f6]">
                        <span className="bg-[#f3f4f6] text-[#4a5565] text-[12px] font-medium px-[8px] py-[2px] rounded-[4px] leading-[16px]">
                          {agency.licenseTypeCount} ประเภท
                        </span>
                      </td>
                      {/* MOCK: replace with real counts when user/license endpoints support groupBy-agency */}
                      <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">—</td>
                      <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">—</td>
                      <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">—</td>
                      <td className="px-[12px] py-[8px] border-b-[0.8px] border-[#f3f4f6]">
                        <span className={`${chip.bg} ${chip.text} text-[12px] font-medium px-[8px] py-[2px] rounded-[4px] inline-block leading-[16px]`}>
                          {chip.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
