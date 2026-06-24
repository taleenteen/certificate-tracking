'use client';

import { SuperAdminSidebar } from '@/components/super-admin/super-admin-sidebar';
import { SuperAdminHeader } from '@/components/super-admin/super-admin-header';
import { RoleGate } from '@/components/auth/Guards';
import { ReactNode, useState } from 'react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGate
      roles={['super_admin']}
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-fuji-light font-kanit text-slate-600">
          <div className="text-center p-8 bg-white border border-gray-200 rounded-square shadow-smooth-medium max-w-sm">
            <p className="text-rose-500 font-bold text-[16px] mb-2">เข้าถึงไม่ได้ / Access Denied</p>
            <p className="text-[13px] text-placeholder">คุณไม่มีสิทธิ์ Super Admin ในการเข้าถึงหน้านี้</p>
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen bg-fuji-light font-kanit">
        <SuperAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <SuperAdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
