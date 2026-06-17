'use client';

import { 
  LayoutDashboard, 
  UserCog, 
  Building2, 
  Network, 
  History, 
  ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  href = "#"
}: { 
  icon: any, 
  label: string, 
  active?: boolean,
  href?: string
}) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-square transition-all ${
      active 
        ? 'bg-brand-primary text-white shadow-smooth-low' 
        : 'text-text-secondary hover:bg-fuji-light hover:text-text-primary'
    }`}
  >
    <Icon className="size-5" />
    <span className="text-[14px] font-medium leading-none">{label}</span>
  </Link>
);

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-background border-r border-border-default flex flex-col shrink-0 h-screen sticky top-0">
      <div className="h-[80px] flex items-center px-6 border-b border-border-default">
         <Image 
           src="/assets/brand/e-license-logo.png" 
           alt="E-License Verification Platform" 
           width={156} 
           height={35} 
           className="w-auto h-8 object-contain"
           priority
         />
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div>
          <p className="px-4 mb-3 text-[12px] font-bold text-text-placeholder uppercase tracking-[1.5px]">เมนูระบบ</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="แดชบอร์ดระบบ" 
              href="/dashboard" 
              active={pathname === '/dashboard'} 
            />
            <SidebarItem 
              icon={UserCog} 
              label="จัดการบัญชี Admin" 
              href="/admin-accounts" 
              active={pathname === '/admin-accounts'} 
            />
            <SidebarItem 
              icon={Building2} 
              label="หน่วยงาน & ข้อมูลหลัก" 
              href="/agencies"
              active={pathname === '/agencies'}
            />
            <SidebarItem 
              icon={Network} 
              label="การเชื่อมต่อระบบ & สถานะ" 
              href="/connections"
              active={pathname === '/connections'}
            />
            <SidebarItem 
              icon={History} 
              label="Audit Log (ทั้งระบบ)" 
              href="/audit-logs"
              active={pathname === '/audit-logs'}
            />
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-border-default">
        <button className="flex items-center justify-center gap-2 text-text-placeholder py-3 w-full rounded-square hover:bg-fuji-light hover:text-text-primary transition-colors">
          <ChevronLeft className="size-4" />
          <span className="text-[13px] font-medium">ซ่อนแถบเมนู</span>
        </button>
      </div>
    </aside>
  );
}
