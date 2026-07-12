'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useAuth';
import { Eye, EyeOff, KeyRound, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';

const isDev = process.env.NEXT_PUBLIC_ENV === 'development';

export function AdminPortalLoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', totpCode: isDev ? '000000' : '' });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({
      type: 'self',
      ...form,
      username: form.username.trim().toLowerCase(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">Back-office access</p>
          <p className="text-xs text-slate-500">บัญชีผู้ดูแลระบบต้องยืนยันด้วย OTP</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="portal-username">ชื่อผู้ใช้งาน</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="portal-username" autoComplete="username" required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.toLowerCase() })} className="h-11 border-slate-200 bg-slate-50 pl-9 focus:bg-white" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="portal-password">รหัสผ่าน</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="portal-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-11 border-slate-200 bg-slate-50 pl-9 pr-10 focus:bg-white" />
          <button type="button" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="portal-totp">รหัส OTP (6 หลัก)</Label>
        <Input id="portal-totp" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={form.totpCode} onChange={(event) => setForm({ ...form, totpCode: event.target.value.replace(/\D/g, '').slice(0, 6) })} className="h-11 border-slate-200 bg-slate-50 text-center font-mono text-lg tracking-[0.5em] focus:bg-white" />
      </div>

      {login.isError && <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-center text-sm text-rose-600">{login.error instanceof Error ? login.error.message : 'ข้อมูลไม่ถูกต้อง'}</p>}

      <Button type="submit" disabled={login.isPending} className="h-11 w-full rounded-lg bg-emerald-700 font-semibold text-white hover:bg-emerald-800">
        {login.isPending ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
      </Button>
    </form>
  );
}
