import { SuperAdminSidebar } from '@/components/super-admin/super-admin-sidebar';
import { SuperAdminHeader } from '@/components/super-admin/super-admin-header';
import { ReactNode } from 'react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-fuji-light font-kanit">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
