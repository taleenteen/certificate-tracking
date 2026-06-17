import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { RoleGate } from '@/components/auth/Guards';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate 
      roles={['admin', 'supervisor']} 
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-fuji-light font-kanit text-slate-600">
          <div className="text-center p-8 bg-white border border-gray-200 rounded-square shadow-smooth-medium max-w-sm">
            <p className="text-rose-500 font-bold text-[16px] mb-2">เข้าถึงไม่ได้ / Access Denied</p>
            <p className="text-[13px] text-placeholder">คุณไม่มีสิทธิ์ในการเข้าถึงหน้าข้อมูลผู้ดูแลหน่วยงานนี้</p>
          </div>
        </div>
      }
    >
      <div className="flex min-h-screen bg-fuji-light font-kanit">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGate>
  );
}
