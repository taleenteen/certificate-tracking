'use client';

import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, Phone, User } from 'lucide-react';

export function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const register = useRegister();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({
      ...formData,
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
    });
  };

  const field = <K extends keyof typeof formData>(key: K) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData({
        ...formData,
        [key]: key === 'username' || key === 'email'
          ? e.target.value.toLowerCase()
          : e.target.value,
      }),
  });

  return (
    <div className="p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            ชื่อ-นามสกุล
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="fullName"
              placeholder="สมชาย ใจดี"
              required
              {...field('fullName')}
              className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Username + Phone side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-username" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              ชื่อผู้ใช้
            </Label>
            <Input
              id="reg-username"
              placeholder="username"
              required
              {...field('username')}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              โทรศัพท์
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                placeholder="0812345678"
                required
                {...field('phone')}
                className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            อีเมล
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="somchai@example.com"
              required
              {...field('email')}
              className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            รหัสผ่าน
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              {...field('password')}
              className="pl-9 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {register.isError && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">
            การลงทะเบียนล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#1e7d55] hover:bg-[#186647] text-white font-semibold text-sm"
          disabled={register.isPending}
        >
          {register.isPending ? 'กำลังดำเนินการ...' : 'สร้างบัญชี'}
        </Button>
      </form>

      <div className="h-px bg-slate-100" />

      <p className="text-center text-xs text-slate-500">
        มีบัญชีอยู่แล้ว?{' '}
        <button type="button" onClick={onToggle} className="font-semibold text-[#1e7d55] hover:underline">
          เข้าสู่ระบบ
        </button>
      </p>
    </div>
  );
}
