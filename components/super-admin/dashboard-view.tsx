import React from 'react';
import { 
  LayoutDashboard, 
  UserCog, 
  Building2, 
  Network, 
  History, 
  ChevronLeft,
  ChevronDown,
  Bell,
  Search,
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  Users,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// --- Sub-components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false 
}: { 
  icon: any, 
  label: string, 
  active?: boolean 
}) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
    active 
      ? 'bg-[#4a9b72] text-white shadow-sm' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`}>
    <Icon className="size-4" />
    <span className="text-[13px] font-medium leading-none">{label}</span>
  </div>
);

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
  <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
    <CardContent className="p-4 pt-5">
      <div className="flex gap-3 items-start">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="size-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-[12px] font-semibold text-slate-800 leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-400 font-medium">{subTitle}</p>
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <span className="text-2xl font-bold text-[#1c2b3a] tracking-tight">{value}</span>
        {change && (
          <div className="flex items-center gap-1 bg-emerald-50 text-[#009966] rounded-full px-2 py-0.5 text-[11px] font-bold">
            <TrendingUp className="size-3" />
            {change}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// --- Main Page Component ---

export default function SuperAdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f4f6f8] font-kanit">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="h-[75px] flex items-center px-6 border-b border-slate-100">
           <div className="flex items-center gap-2">
             <div className="size-8 bg-[#4a9b72] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[14px] font-bold text-slate-800 leading-tight">E-License</span>
               <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Verification Platform</span>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[1.5px]">เมนู</p>
            <div className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="แดชบอร์ดระบบ" active />
              <SidebarItem icon={UserCog} label="จัดการบัญชี Admin" />
              <SidebarItem icon={Building2} label="หน่วยงาน & ข้อมูลหลัก" />
              <SidebarItem icon={Network} label="การเชื่อมต่อระบบ & สถานะ" />
              <SidebarItem icon={History} label="Audit Log (ทั้งระบบ)" />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 py-2 cursor-pointer hover:text-slate-600 transition-colors">
            <ChevronLeft className="size-3.5" />
            <span className="text-[11px] font-medium">ซ่อนแถบเมนู</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[75px] bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-[20px] font-bold text-[#1c2b3a]">แดชบอร์ดระบบ</h1>
          
          <div className="flex items-center gap-4">
             <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-100">
                <Bell className="size-5" />
             </div>
             
             <div className="h-10 px-3 py-1.5 border border-slate-100 rounded-xl flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-all">
                <Avatar className="size-7 border border-slate-200">
                  <AvatarImage src="https://www.figma.com/api/mcp/asset/2ad2fe0c-5e2a-40a1-8920-951e0122f6e4" />
                  <AvatarFallback>อน</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-[#1c2b3a] leading-none">อรณิชา เพชรวรสกุล</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">ผู้ดูแลระบบ</span>
                </div>
                <ChevronDown className="size-3.5 text-slate-300 ml-1" />
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Building2}
                title="จำนวนหน่วยงานทั้งหมด"
                subTitle="หน่วยงานที่เชื่อมต่อระบบ"
                value="5"
                colorClass="bg-[#dbeafe] text-[#2563eb]"
              />
              <StatCard 
                icon={UserCog}
                title="จำนวนบัญชี Admin"
                subTitle="ตัวแทนหน่วยงานทั้งหมด"
                value="14"
                change="2 ใหม่"
                colorClass="bg-[#f3e8ff] text-[#9333ea]"
              />
              <StatCard 
                icon={Users}
                title="จำนวนเจ้าหน้าที่ทั้งหมด"
                subTitle="ทุกหน่วยงานรวมกัน"
                value="59"
                change="12.3%"
                colorClass="bg-[#fef3c6] text-[#d97706]"
              />
              <StatCard 
                icon={FileText}
                title="จำนวนใบอนุญาตทั้งหมด"
                subTitle="ครอบคลุม 5 ประเภท"
                value="8,570"
                change="5.2%"
                colorClass="bg-[#d1fae5] text-[#059669]"
              />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Agency Summary Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[16px] font-bold text-[#1c2b3a]">สรุปข้อมูลต่อหน่วยงาน</h2>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-[12px] font-medium h-8">
                    ดูทั้งหมด
                  </Button>
                </div>
                
                <Card className="rounded-2xl border-none shadow-md overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f9fafb] border-b border-slate-100">
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">หน่วยงาน</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">ประเภทใบอนุญาต</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">เจ้าหน้าที่</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">ใบอนุญาต</th>
                          <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { agency: 'DIW', full: 'กรมโรงงานฯ', types: ['ร.ง.4', 'วัตถุอันตราย'], staff: 12, licenses: '1,840', status: 'ปกติ', statusColor: 'bg-emerald-50 text-emerald-600' },
                          { agency: 'ACFS', full: 'มกอช.', types: ['ใบอนุญาตผลิต', 'ใบอนุญาตนำเข้า'], staff: 22, licenses: '3,210', status: 'ปกติ', statusColor: 'bg-emerald-50 text-emerald-600' },
                          { agency: 'FDA', full: 'อย.', types: ['ใบอนุญาตผลิต', 'ใบสำคัญอาหาร'], staff: 18, licenses: '2,540', status: 'ตรวจสอบ', statusColor: 'bg-amber-50 text-amber-600' },
                          { agency: 'DBD', full: 'กรมพัฒนาธุรกิจฯ', types: ['ใบทะเบียนพาณิชย์'], staff: 7, licenses: '980', status: 'ปกติ', statusColor: 'bg-emerald-50 text-emerald-600' },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-[#4a9b72]">{row.agency}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{row.full}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-wrap gap-1.5">
                                {row.types.map((t, ti) => (
                                  <span key={ti} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center text-[13px] text-slate-600 font-medium">{row.staff}</td>
                            <td className="px-6 py-5 text-center text-[13px] text-slate-700 font-bold">{row.licenses}</td>
                            <td className="px-6 py-5">
                              <span className={`${row.statusColor} text-[11px] font-bold px-2.5 py-1 rounded-full border-none`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h2 className="text-[16px] font-bold text-[#1c2b3a] px-1">แจ้งเตือนระบบ</h2>
                <Card className="rounded-2xl border-none shadow-md bg-white p-6 h-[400px]">
                  <div className="space-y-6">
                    {[
                      { msg: 'Consumer-Key ใกล้หมดอายุ (กรมโรงงานฯ)', time: '2 ชม. ที่แล้ว', type: 'error' },
                      { msg: 'การซิงค์ข้อมูลล้มเหลว จาก อย.', time: '5 ชม. ที่แล้ว', type: 'error' },
                      { msg: 'บัญชี Admin ใหม่ รอการยืนยัน', time: '1 วัน ที่แล้ว', type: 'info' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start group">
                        <div className={`mt-1 size-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          <AlertCircle className="size-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] text-slate-700 font-bold leading-tight group-hover:text-brand-primary transition-colors cursor-pointer">{item.msg}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-8 rounded-xl border-slate-100 text-slate-500 text-[12px] font-bold hover:bg-slate-50">
                    ดูแจ้งเตือนทั้งหมด
                  </Button>
                </Card>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
