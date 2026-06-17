'use client';

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-brand-surface p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-20 h-20 mb-2">
             {/* Logo placeholder - using image if available, else stylized icon */}
             <div className="w-full h-full bg-brand-primary rounded-square-hard flex items-center justify-center shadow-smooth-low">
                <span className="text-white font-bold text-3xl">CT</span>
             </div>
          </div>
          <h1 className="text-2xl font-bold text-brand-text-dark">Certificate Tracking</h1>
          <p className="text-sm text-slate-500 text-center">ระบบบริหารจัดการและตรวจสอบใบอนุญาต</p>
        </div>

        {mode === 'login' ? (
          <LoginForm onToggle={() => setMode('register')} />
        ) : (
          <RegisterForm onToggle={() => setMode('login')} />
        )}

        <p className="text-[10px] text-slate-400 text-center mt-4">
          © 2026 Certificate Tracking System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
