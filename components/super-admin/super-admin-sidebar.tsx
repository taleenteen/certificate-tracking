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
import type { LucideIcon } from 'lucide-react';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  href = "#"
}: { 
  icon: LucideIcon, 
  label: string, 
  active?: boolean,
  href?: string
}) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-square transition-all ${
      active 
        ? 'bg-brand-primary text-white shadow-smooth-low' 
        : 'text-sub hover:bg-fuji-light hover:text-main'
    }`}
  >
    <Icon className="size-5" />
    <span className="text-[14px] font-medium leading-none">{label}</span>
  </Link>
);

export function SuperAdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, sticky sidebar on desktop */}
      <aside
        className={[
          'w-[260px] bg-background border-r border-gray-200 flex flex-col shrink-0 h-screen',
          // mobile: fixed drawer, slides in/out
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // desktop: back to normal sticky flow
          'lg:static lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto',
        ].join(' ')}
      >
        <div className="h-[80px] flex items-center px-6 border-b border-gray-200 justify-between">
          <Image
            src="/assets/brand/e-license-logo.png"
            alt="E-License Verification Platform"
            width={156}
            height={35}
            className="w-auto h-8 object-contain"
            priority
          />
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-placeholder hover:text-main hover:bg-fuji-light rounded-square"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="px-4 mb-3 text-[12px] font-bold text-placeholder uppercase tracking-[1.5px]">เมนูระบบ</p>
            <div className="space-y-1">
              <SidebarItem
                icon={LayoutDashboard}
                label="แดชบอร์ดระบบ"
                href="/super-admin/dashboard"
                active={pathname === '/super-admin/dashboard'}
              />
              <SidebarItem
                icon={UserCog}
                label="จัดการผู้ใช้และสิทธิ์"
                href="/super-admin/admin-accounts"
                active={pathname === '/super-admin/admin-accounts'}
              />
              <SidebarItem
                icon={Building2}
                label="หน่วยงาน & ข้อมูลหลัก"
                href="/super-admin/agencies"
                active={pathname === '/super-admin/agencies'}
              />
              <SidebarItem
                icon={Network}
                label="การเชื่อมต่อระบบ & สถานะ"
                href="/super-admin/connections"
                active={pathname === '/super-admin/connections'}
              />
              <SidebarItem
                icon={History}
                label="Audit Log (ทั้งระบบ)"
                href="/super-admin/audit-logs"
                active={pathname === '/super-admin/audit-logs'}
              />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 hidden lg:block">
          <button className="flex items-center justify-center gap-2 text-placeholder py-3 w-full rounded-square hover:bg-fuji-light hover:text-main transition-colors">
            <ChevronLeft className="size-4" />
            <span className="text-[13px] font-medium">ซ่อนแถบเมนู</span>
          </button>
        </div>
      </aside>
    </>
  );
}
