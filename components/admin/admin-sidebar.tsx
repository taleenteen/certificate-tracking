'use client';

import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  ClipboardList, 
  History, 
  FileText,
  ChevronLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  disabled = false,
  href = "#"
}: SidebarItemProps) => {
  if (disabled) {
    return (
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-square text-slate-300 cursor-not-allowed select-none"
        title="ฟังก์ชันนี้จะเปิดใช้งานในอนาคต"
      >
        <Icon className="size-5 text-slate-300" />
        <span className="text-[14px] font-medium leading-none">{label}</span>
      </div>
    );
  }

  return (
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
};

export function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, sticky on desktop */}
      <aside
        className={[
          'w-[260px] bg-background border-r border-gray-200 flex flex-col shrink-0 h-screen',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto',
        ].join(' ')}
      >
        {/* Brand Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="px-4 mb-3 text-[12px] font-bold text-placeholder uppercase tracking-[1.5px]">เมนู</p>
            <div className="space-y-1">
              <SidebarItem icon={LayoutDashboard} label="แดชบอร์ด" disabled />
              <SidebarItem icon={Users} label="จัดการเจ้าหน้าที่" disabled />
              <SidebarItem icon={FileSpreadsheet} label="จัดการข้อมูลใบอนุญาต" disabled />
              <SidebarItem
                icon={ClipboardList}
                label="งานตรวจสอบ (มอบหมายงาน)"
                href="/admin/inspections"
                active={pathname.startsWith('/admin/inspections')}
              />
              <SidebarItem icon={History} label="Audit Log & ตั้งค่า" disabled />
              <SidebarItem icon={FileText} label="ใบอนุญาตของฉัน" disabled />
            </div>
          </div>
        </nav>

        {/* Hide menu button at bottom — desktop only */}
        <div className="p-4 border-t border-gray-200 hidden lg:block">
          <button className="flex items-center justify-center gap-2 text-placeholder py-3 w-full rounded-square hover:bg-fuji-light hover:text-main transition-colors cursor-pointer">
            <ChevronLeft className="size-4" />
            <span className="text-[13px] font-medium">ซ่อนแถบเมนู</span>
          </button>
        </div>
      </aside>
    </>
  );
}
