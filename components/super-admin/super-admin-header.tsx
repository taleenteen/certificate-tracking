'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { usePathname } from 'next/navigation';

export function SuperAdminHeader() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  let title = 'แดชบอร์ดระบบ';
  if (pathname.includes('/admin-accounts')) {
    title = 'จัดการบัญชี Admin';
  } else if (pathname.includes('/agencies')) {
    title = 'หน่วยงาน & ข้อมูลหลัก';
  } else if (pathname.includes('/connections')) {
    title = 'การเชื่อมต่อระบบ & สถานะระบบ';
  } else if (pathname.includes('/audit-logs')) {
    title = 'Audit Log (ทั้งระบบ)';
  }

  return (
    <header className="h-[80px] bg-background border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10">
      <h1 className="text-[22px] font-bold text-main">{title}</h1>

      
      <div className="flex items-center gap-5">
         <button className="size-11 rounded-full bg-fuji-light flex items-center justify-center text-sub hover:bg-fuji-soft transition-colors border border-gray-200 relative">
            <Bell className="size-5" />
            <span className="absolute top-2.5 right-2.5 size-2 bg-semantic-critical rounded-full border border-background"></span>
         </button>
         
         <div className="h-12 px-4 py-2 border border-gray-200 rounded-square flex items-center gap-3 hover:bg-fuji-light cursor-pointer transition-all">
            <Avatar className="size-8 border border-gray-200">
              <AvatarImage src="https://www.figma.com/api/mcp/asset/2ad2fe0c-5e2a-40a1-8920-951e0122f6e4" />
              <AvatarFallback className="bg-brand-primary text-white">SA</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-main leading-none">
                {user?.fullName || 'อรณิชา เพชรวรสกุล'}
              </span>
              <span className="text-[11px] text-placeholder font-medium mt-1">
                {user?.roles?.includes('superadmin') ? 'Super Admin' : 'ผู้ดูแลระบบ'}
              </span>
            </div>
            <ChevronDown className="size-4 text-placeholder ml-1" />
         </div>
      </div>
    </header>
  );
}
