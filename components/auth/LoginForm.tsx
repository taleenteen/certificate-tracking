'use client';

import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const isDev = process.env.NEXT_PUBLIC_ENV === 'development';

export function LoginForm({ onToggle }: { onToggle: () => void }) {
  const login = useLogin();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ type: 'password', ...formData });
  };

  const handleTangRatLogin = () => {
    const tangRatUrl = process.env.NEXT_PUBLIC_IAM_GOV_FRONTEND_URL;
    if (tangRatUrl && !isDev) {
      window.location.href = tangRatUrl;
    } else {
      login.mutate({ type: 'tang-rat', mToken: 'mock-public-owner' });
    }
  };

  const fillDev = (username: string, password: string) => {
    setFormData({ username, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-square-hard shadow-smooth-medium border-none overflow-hidden">
        <div className="h-2 bg-brand-primary w-full" />
        <CardHeader>
          <CardTitle className="text-brand-primary text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>เข้าสู่ระบบด้วยบัญชี Digital ID หรือชื่อผู้ใช้และรหัสผ่าน</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Tang Rat / Digital ID */}
          <Button
            className="w-full bg-[#2B3990] hover:bg-[#1E2770] text-white rounded-circle h-12 flex items-center justify-center gap-3"
            onClick={handleTangRatLogin}
            disabled={login.isPending}
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#2B3990] font-bold text-[10px]">ทาง</div>
            เข้าสู่ระบบด้วย ทางรัฐ (Digital ID)
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">หรือ เข้าสู่ระบบด้วยบัญชี</span>
            </div>
          </div>

          {/* Password login */}
          <form onSubmit={handlePasswordLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">ชื่อผู้ใช้งาน หรือ อีเมล</Label>
              <Input
                id="username"
                placeholder="username หรือ email@example.com"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="rounded-square h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-square h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-circle h-12 text-lg mt-2"
              disabled={login.isPending}
            >
              {login.isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="text-center text-sm">
            ยังไม่มีบัญชี?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="text-brand-primary font-semibold hover:underline"
            >
              สมัครสมาชิกใหม่
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Dev hint — only shown when NEXT_PUBLIC_ENV=development */}
      {isDev && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-700">บัญชีทดสอบ (dev only)</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fillDev('public-owner', 'password')}
              className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono"
            >
              public-owner / password
            </button>
          </div>
          <p className="text-slate-400">เจ้าหน้าที่/ผู้ดูแล → ใช้ปุ่ม ทางรัฐ ด้านบน</p>
        </div>
      )}

      {login.isError && (
        <p className="text-sm text-destructive text-center font-medium bg-destructive/10 py-2 rounded-md px-3">
          {login.error instanceof Error
            ? login.error.message
            : 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง'}
        </p>
      )}
    </div>
  );
}
