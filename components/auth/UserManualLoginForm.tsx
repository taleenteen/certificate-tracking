'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/useAuth';
import { Eye, EyeOff, KeyRound, User } from 'lucide-react';
import { useState } from 'react';

export function UserManualLoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({
      type: 'password',
      ...form,
      username: form.username.trim().toLowerCase(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-sm font-bold text-slate-900">Manual account access</p>
        <p className="mt-1 text-xs text-slate-500">สำหรับบัญชีผู้ใช้งานทั่วไปที่มี username และ password</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="manual-username">ชื่อผู้ใช้หรืออีเมล</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="manual-username" autoComplete="username" required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.toLowerCase() })} className="h-11 border-slate-200 bg-slate-50 pl-9 focus:bg-white" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="manual-password">รหัสผ่าน</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="manual-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-11 border-slate-200 bg-slate-50 pl-9 pr-10 focus:bg-white" />
          <button type="button" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {login.isError && <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-center text-sm text-rose-600">{login.error instanceof Error ? login.error.message : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'}</p>}

      <Button type="submit" disabled={login.isPending} className="h-11 w-full rounded-lg bg-emerald-700 font-semibold text-white hover:bg-emerald-800">
        {login.isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </Button>
    </form>
  );
}
