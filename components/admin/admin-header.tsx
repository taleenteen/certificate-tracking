'use client';

import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/hooks/useAuth';
import { useAgencies } from '@/hooks/useAgencies';
import { useState, useRef, useEffect } from 'react';

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: agencies = [] } = useAgencies();
  const userAgency = agencies.find((a) => a.id === user?.agencyId);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const displayName = user?.fullName || 'ชนธัญ เพชรรสสกุล';
  const displayAgency = userAgency?.nameTh ?? userAgency?.code ?? 'กรมโรงงานอุตสาหกรรม';

  return (
    <header className="h-[80px] bg-background border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      {/* Left: hamburger + title/agency */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 p-2 text-sub hover:bg-fuji-light rounded-square border border-gray-200"
          >
            <Menu className="size-5" />
          </button>
        )}
        <div className="flex flex-col text-left min-w-0">
          <h1 className="text-[16px] md:text-[22px] font-bold text-main leading-snug line-clamp-2 md:truncate md:line-clamp-none">
            งานตรวจสอบ (มอบหมายงาน)
          </h1>
          <p className="text-[11px] md:text-[12px] text-placeholder font-medium mt-0.5 truncate">
            หน่วยงาน: {displayAgency}
          </p>
        </div>
      </div>

      {/* Right: profile */}
      <div className="flex items-center shrink-0">
        <div className="relative" ref={dropdownRef}>
          {/* Mobile: circle only */}
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

          {/* Desktop: full pill */}
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
                ผู้ดูแลหน่วยงาน
              </span>
            </div>
            <ChevronDown className="size-4 text-placeholder ml-1" />
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-square border border-gray-200 bg-white shadow-smooth-medium py-1.5 z-20 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-[13px] font-bold text-main truncate">{displayName}</p>
                <p className="text-[11px] text-placeholder truncate">{userAgency ? `${userAgency.code} — ${userAgency.nameTh}` : '—'}</p>
              </div>
              <button
                onClick={handleLogout}
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
