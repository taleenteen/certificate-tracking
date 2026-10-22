import { AdminPortalLoginForm } from '@/components/auth/AdminPortalLoginForm';

export const metadata = {
  title: 'Portal Access',
  robots: { index: false, follow: false },
};

export default function PortalAccessPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-[400px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <AdminPortalLoginForm />
      </section>
    </main>
  );
}
