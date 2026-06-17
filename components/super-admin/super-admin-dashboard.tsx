import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  UserSquare2, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';

// Sub-component for Stat Cards
const StatCard = ({ 
  icon: Icon, 
  title, 
  subTitle, 
  value, 
  change, 
  colorClass 
}: { 
  icon: any, 
  title: string, 
  subTitle: string, 
  value: string | number, 
  change?: string, 
  colorClass: string 
}) => (
  <Card className="rounded-2xl border-none shadow-smooth-low bg-white overflow-hidden">
    <CardContent className="p-4 pt-5">
      <div className="flex gap-3 items-start">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-[12px] font-semibold text-slate-800 leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{subTitle}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {change && (
          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none rounded-full px-2 py-0.5 text-[11px] font-semibold">
            <TrendingUp className="size-2.5 mr-1" />
            {change}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

export function SuperAdminDashboard() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Building2}
          title="จำนวนหน่วยงานทั้งหมด"
          subTitle="หน่วยงานที่เชื่อมต่อระบบ"
          value="5"
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          icon={UserSquare2}
          title="จำนวนบัญชี Admin"
          subTitle="ตัวแทนหน่วยงานทั้งหมด"
          value="14"
          change="2 ใหม่"
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard 
          icon={Users}
          title="จำนวนเจ้าหน้าที่ทั้งหมด"
          subTitle="ทุกหน่วยงานรวมกัน"
          value="59"
          change="12.3%"
          colorClass="bg-amber-100 text-amber-600"
        />
        <StatCard 
          icon={FileText}
          title="จำนวนใบอนุญาตทั้งหมด"
          subTitle="ครอบคลุม 5 ประเภท"
          value="8,570"
          change="5.2%"
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">สรุปข้อมูลต่อหน่วยงาน</h2>
          </div>
          <Card className="rounded-2xl border-none shadow-smooth-low overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500">หน่วยงาน</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500">ประเภทใบอนุญาตที่รับผิดชอบ</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 text-center">จำนวน Admin</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 text-center">จำนวนเจ้าหน้าที่</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 text-center">จำนวนใบอนุญาต</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-slate-500">สถานะข้อมูล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { agency: 'DIW', full: 'กรมโรงงานฯ', types: ['ร.ง.4', 'วัตถุอันตราย'], admins: 3, staff: 12, licenses: '1,840', status: 'ปกติ', statusColor: 'bg-emerald-100 text-emerald-700' },
                    { agency: 'ACFS', full: 'มกอช.', types: ['ใบอนุญาตผลิต', 'ใบอนุญาตนำเข้า', 'GAP/HACCP'], admins: 5, staff: 22, licenses: '3,210', status: 'ปกติ', statusColor: 'bg-emerald-100 text-emerald-700' },
                    { agency: 'FDA', full: 'อย.', types: ['ใบอนุญาตผลิต', 'ใบสำคัญอาหาร'], admins: 4, staff: 18, licenses: '2,540', status: 'ตรวจสอบ', statusColor: 'bg-amber-100 text-amber-700' },
                    { agency: 'DBD', full: 'กรมพัฒนาธุรกิจฯ', types: ['ใบทะเบียนพาณิชย์'], admins: 2, staff: 7, licenses: '980', status: 'ปกติ', statusColor: 'bg-emerald-100 text-emerald-700' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-brand-primary">{row.agency}</span>
                          <span className="text-[11px] text-slate-400">{row.full}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {row.types.map((t, ti) => (
                            <Badge key={ti} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-[10px] font-normal border-none rounded px-2 py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-[12px] text-slate-700">{row.admins}</td>
                      <td className="px-4 py-4 text-center text-[12px] text-slate-700">{row.staff}</td>
                      <td className="px-4 py-4 text-center text-[12px] text-slate-700 font-medium">{row.licenses}</td>
                      <td className="px-4 py-4">
                        <Badge className={`${row.statusColor} hover:${row.statusColor} border-none rounded-md px-2 py-0.5 text-[11px] font-medium`}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">รายการแจ้งเตือนระดับระบบ</h2>
          <Card className="rounded-2xl border-none shadow-smooth-low bg-white p-4 h-full min-h-[300px]">
            <div className="space-y-4">
              {[
                'Consumer-Key ใกล้หมดอายุ',
                'การซิงค์ข้อมูลล้มเหลว',
                'บัญชี Admin ที่ยังไม่มีหน่วยงานในสังกัด'
              ].map((msg, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="p-1.5 rounded-full bg-rose-50 text-rose-500 mt-0.5">
                    <AlertCircle className="size-3.5" />
                  </div>
                  <p className="text-[12px] text-slate-700 leading-snug">{msg}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
