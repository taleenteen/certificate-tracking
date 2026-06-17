'use client';

import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export function SuperAdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const displayName = user?.fullName || 'ผู้ดูแลระบบสูงสุด';

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="h-[80px] bg-background border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-10">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 mr-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 p-2 text-sub hover:bg-fuji-light rounded-square border border-gray-200"
          >
            <Menu className="size-5" />
          </button>
        )}
        {/* Allow wrapping on small screens; truncate on desktop */}
        <h1 className="text-[16px] md:text-[22px] font-bold text-main leading-snug line-clamp-2 md:truncate md:line-clamp-none">
          {title}
        </h1>
      </div>

      {/* Right: bell + profile */}
      <div className="flex items-center gap-2 md:gap-5 shrink-0">
        <button className="size-10 md:size-11 rounded-full bg-fuji-light flex items-center justify-center text-sub hover:bg-fuji-soft transition-colors border border-gray-200 relative">
          <Bell className="size-4 md:size-5" />
          <span className="absolute top-2 right-2 size-2 bg-semantic-critical rounded-full border border-background" />
        </button>

        <div className="relative" ref={dropdownRef}>
          {/* Mobile: circle avatar only */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-label="โปรไฟล์"
          >
            <Avatar className="size-10 border-2 border-brand-primary cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Desktop: full pill with name + chevron */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex h-12 px-4 py-2 border border-gray-200 rounded-square items-center gap-3 hover:bg-fuji-light cursor-pointer transition-all select-none"
          >
            <Avatar className="size-8 border border-gray-200">
              <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-main leading-none">
                {displayName}
              </span>
              <span className="text-[11px] text-placeholder font-medium mt-1">
                Super Admin
              </span>
            </div>
            <ChevronDown className="size-4 text-placeholder ml-1" />
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-square border border-gray-200 bg-white shadow-smooth-medium py-1.5 z-20 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-[13px] font-bold text-main truncate">{displayName}</p>
                <p className="text-[11px] text-placeholder truncate">Super Admin</p>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="size-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

