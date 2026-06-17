'use client';

import { ChevronDown, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { useLogout } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export function AdminHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
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
  const displayAgency = user?.agency || 'กรมโรงงานอุตสาหกรรม';

  return (
    <header className="h-[80px] bg-background border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Title & Agency Context */}
      <div className="flex flex-col text-left">
        <h1 className="text-[22px] font-bold text-main leading-tight">งานตรวจสอบ (มอบหมายงาน)</h1>
        <p className="text-[12px] text-placeholder font-medium mt-0.5">หน่วยงาน: {displayAgency}</p>
      </div>

      {/* User Profile Dropdown */}
      <div className="flex items-center gap-5">
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 px-4 py-2 border border-gray-200 rounded-square flex items-center gap-3 hover:bg-fuji-light cursor-pointer transition-all select-none"
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
                <p className="text-[11px] text-placeholder truncate">{user?.agency || 'DIW Agency'}</p>
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
