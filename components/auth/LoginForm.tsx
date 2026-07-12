'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();

  return (
    <div className="p-6">
      <Button
        type="button"
        className="h-12 w-full justify-center gap-2.5 rounded-xl bg-[#1a2a80] text-sm font-semibold text-white shadow-sm hover:bg-[#151f66]"
        onClick={() => router.push('/auth/dga')}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#1a2a80]">
          ทาง
        </span>
        เข้าสู่ระบบด้วย ทางรัฐ (Digital ID)
      </Button>
    </div>
  );
}
