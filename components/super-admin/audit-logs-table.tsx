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
import { Download, ArrowRight } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  dateTime: string;
  agency: string;
  user: string;
  target: string;
  action: string;
  field: string;
  oldVal: string;
  newVal: string;
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    dateTime: '15/06/2568 09:14',
    agency: 'DIW',
    user: 'สมชาย วงศ์ทอง',
    target: 'บัญชี Admin #12',
    action: 'สร้างบัญชี',
    field: 'status',
    oldVal: '——',
    newVal: 'Active',
  },
  {
    id: '2',
    dateTime: '15/06/2568 08:52',
    agency: 'ACFS',
    user: 'วิภา รัตนสุข',
    target: 'ใบอนุญาต #990234',
    action: 'อนุมัติใบอนุญาต',
    field: 'status',
    oldVal: 'รออนุมัติ',
    newVal: 'อนุมัติ',
  },
  {
    id: '3',
    dateTime: '15/06/2568 08:30',
    agency: 'FDA',
    user: 'อรณิชา เพชรวรสกุล (Super Admin)',
    target: 'หน่วยงาน FDA',
    action: 'แก้ไข scope',
    field: 'license_types',
    oldVal: 'ใบอนุญาตผลิต',
    newVal: 'ใบอนุญาตผลิต, ใบสำคัญอาหาร',
  },
  {
    id: '4',
    dateTime: '14/06/2568 17:45',
    agency: 'DIW',
    user: 'สมชาย วงศ์ทอง',
    target: 'ใบอนุญาต #880011',
    action: 'ปฏิเสธใบอนุญาต',
    field: 'status',
    oldVal: 'รออนุมัติ',
    newVal: 'ปฏิเสธ',
  },
  {
    id: '5',
    dateTime: '14/06/2568 16:20',
    agency: 'DBD',
    user: 'นภา สุขใจ',
    target: 'บัญชีเจ้าหน้าที่ #5',
    action: 'แก้ไขบัญชี',
    field: 'email',
    oldVal: 'old@dbd.go.th',
    newVal: 'new@dbd.go.th',
  },
  {
    id: '6',
    dateTime: '14/06/2568 15:00',
    agency: 'ACFS',
    user: 'อรณิชา เพชรวรสกุล (Super Admin)',
    target: 'Admin CZP-00456',
    action: 'เพิ่มหน่วยงาน',
    field: 'agencies',
    oldVal: 'ACFS',
    newVal: 'ACFS, DIW',
  },
];

export function AuditLogsTable() {
  const [logs] = React.useState<AuditLogEntry[]>(INITIAL_LOGS);
  
  // Filter States
  const [agencyFilter, setAgencyFilter] = React.useState('ALL');
  const [userFilter, setUserFilter] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('ALL');
  const [fieldFilter, setFieldFilter] = React.useState('ALL');

  // Filter logs logic
  const filteredLogs = logs.filter((log) => {
    const matchesAgency = agencyFilter === 'ALL' || log.agency === agencyFilter;
    const matchesUser = log.user.toLowerCase().includes(userFilter.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesField = fieldFilter === 'ALL' || log.field === fieldFilter;

    return matchesAgency && matchesUser && matchesAction && matchesField;
  });

  // Unique lists for dropdowns
  const uniqueAgencies = Array.from(new Set(logs.map((l) => l.agency)));
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueFields = Array.from(new Set(logs.map((l) => l.field)));

  // Premium CSV Exporter (UTF-8 with BOM for correct Thai display in Excel)
  const handleExportCSV = () => {
    const headers = ['วันที่-เวลา', 'หน่วยงาน', 'ผู้ใช้งาน', 'บทบาท/เป้าหมาย', 'การกระทำ', 'รายการที่เปลี่ยน', 'ค่าเดิม', 'ค่าใหม่'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map((log) => [
        log.dateTime,
        log.agency,
        `"${log.user}"`,
        `"${log.target}"`,
        `"${log.action}"`,
        log.field,
        `"${log.oldVal}"`,
        `"${log.newVal}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransitionStyle = (field: string, val: string, isNew: boolean) => {
    if (val === '——') return 'text-text-disable';
    if (field === 'status') {
      if (val === 'Active' || val === 'อนุมัติ') return 'text-semantic-success font-semibold';
      if (val === 'Inactive' || val === 'ปฏิเสธ') return 'text-text-critical font-semibold';
      return isNew ? 'text-text-primary' : 'text-text-critical';
    }
    return isNew ? 'text-semantic-success font-medium' : 'text-text-critical font-medium';
  };

  return (
    <div className="space-y-[16px]">
      {/* Filters & Export Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-border-default shadow-smooth-low">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          {/* Agency Dropdown */}
          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className="w-full sm:w-[150px] border-border-neutral text-[13px] h-9">
              <SelectValue placeholder="หน่วยงานทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">หน่วยงานทั้งหมด</SelectItem>
              {uniqueAgencies.map((agency) => (
                <SelectItem key={agency} value={agency}>
                  {agency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Input Filter */}
          <Input
            placeholder="ตัวกรอง: ผู้ใช้งาน"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full sm:w-[160px] border-border-neutral text-[13px] h-9"
          />

          {/* Action Dropdown */}
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-border-neutral text-[13px] h-9">
              <SelectValue placeholder="การกระทำทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">การกระทำทั้งหมด</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Changed Field Dropdown */}
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-border-neutral text-[13px] h-9">
              <SelectValue placeholder="รายการที่เปลี่ยนทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">รายการที่เปลี่ยนทั้งหมด</SelectItem>
              {uniqueFields.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="border-border-neutral text-text-primary hover:bg-fuji-light rounded-square px-4 py-1.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9 cursor-pointer"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[12px] border border-border-default shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-fuji-light/30 border-b border-border-default">
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[150px]">
                  วันที่-เวลา
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[110px]">
                  หน่วยงาน
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[220px]">
                  ผู้ใช้งาน
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[180px]">
                  บทบาท / เป้าหมาย
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[140px]">
                  การกระทำ
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[150px]">
                  รายการที่เปลี่ยน
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[250px]">
                  ค่าเดิม —&gt; ค่าใหม่
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-text-placeholder text-[13px]">
                    ไม่พบข้อมูล Audit Log
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    {/* วันที่-เวลา */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-placeholder font-medium font-mono">
                      {row.dateTime}
                    </td>

                    {/* หน่วยงาน */}
                    <td className="px-[16px] py-[12px]">
                      <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                        {row.agency}
                      </span>
                    </td>

                    {/* ผู้ใช้งาน */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-primary font-semibold">
                      {row.user}
                    </td>

                    {/* บทบาท / เป้าหมาย */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-placeholder font-mono font-medium">
                      {row.target}
                    </td>

                    {/* การกระทำ */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-primary font-bold">
                      {row.action}
                    </td>

                    {/* รายการที่เปลี่ยน */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-placeholder font-mono">
                      {row.field}
                    </td>

                    {/* ค่าเดิม —-> ค่าใหม่ */}
                    <td className="px-[16px] py-[12px] text-[12px]">
                      <div className="flex items-center gap-2 font-mono">
                        <span className={getTransitionStyle(row.field, row.oldVal, false)}>
                          {row.oldVal}
                        </span>
                        <ArrowRight className="size-3 text-text-placeholder" />
                        <span className={getTransitionStyle(row.field, row.newVal, true)}>
                          {row.newVal}
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

      {/* Info Tip Box matching bottom box in screenshot */}
      <div className="bg-[#f0f9eb]/40 border border-[#b2e2a2]/40 rounded-[12px] p-[16px] text-left">
        <h4 className="text-[13px] font-bold text-[#4a9b72] mb-1.5">
          Audit Log รวมทุกหน่วยงาน
        </h4>
        <ul className="list-disc pl-5 text-[12px] text-[#4a5565] space-y-1">
          <li><strong>สิทธิ์ Super Admin:</strong> สามารถเรียกดูประวัติบันทึกการทำงานของทุกหน่วยงาน รวมถึงการสร้าง/แก้ไขบัญชีผู้ดูแลระบบ (Admin) และการปรับแต่งสิทธิ์ขอบเขตของหน่วยงาน</li>
          <li><strong>สิทธิ์ Admin:</strong> สามารถเห็นประวัติ Log เฉพาะสำหรับในขอบเขตการทำงานของหน่วยงานตนเองเท่านั้น (คนละมุมมองกับ Super Admin)</li>
        </ul>
      </div>
    </div>
  );
}
