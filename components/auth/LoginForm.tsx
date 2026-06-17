'use client';

import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const isDev = process.env.NEXT_PUBLIC_ENV === 'development';

export function LoginForm({ onToggle }: { onToggle: () => void }) {
  const login = useLogin();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [adminMode, setAdminMode] = useState(false);
  const [adminData, setAdminData] = useState({ username: '', password: '', totpCode: isDev ? '000000' : '' });

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ type: 'password', ...formData });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ type: 'self', ...adminData });
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
        <div className={`h-2 w-full ${adminMode ? 'bg-purple-600' : 'bg-brand-primary'}`} />
        <CardHeader>
          <CardTitle className={`text-2xl font-bold ${adminMode ? 'text-purple-700' : 'text-brand-primary'}`}>
            {adminMode ? 'เข้าสู่ระบบ (เจ้าหน้าที่)' : 'เข้าสู่ระบบ'}
          </CardTitle>
          <CardDescription>
            {adminMode
              ? 'บัญชี Admin / Super Admin ต้องใช้รหัส OTP'
              : 'เข้าสู่ระบบด้วยบัญชี Digital ID หรือชื่อผู้ใช้และรหัสผ่าน'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {!adminMode ? (
            <>
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

              {/* Public password login */}
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
                <button type="button" onClick={onToggle} className="text-brand-primary font-semibold hover:underline">
                  สมัครสมาชิกใหม่
                </button>
              </div>

              {/* Switch to admin mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAdminMode(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-700 font-medium transition-colors"
                >
                  <ShieldCheck className="size-3.5" />
                  เจ้าหน้าที่ / ผู้ดูแลระบบ
                </button>
              </div>
            </>
          ) : (
            /* Admin / Super Admin login with TOTP */
            <form onSubmit={handleAdminLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-username">ชื่อผู้ใช้งาน</Label>
                <Input
                  id="admin-username"
                  placeholder="เช่น superadmin"
                  required
                  autoComplete="username"
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  className="rounded-square h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">รหัสผ่าน</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  className="rounded-square h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totp">
                  รหัส OTP (6 หลัก)
                  {isDev && <span className="ml-2 text-[10px] text-slate-400 font-mono">[dev: 000000]</span>}
                </Label>
                <Input
                  id="totp"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="000000"
                  required
                  value={adminData.totpCode}
                  onChange={(e) => setAdminData({ ...adminData, totpCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="rounded-square h-11 font-mono tracking-widest text-center text-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-circle h-12 text-lg mt-2"
                disabled={login.isPending}
              >
                {login.isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (เจ้าหน้าที่)'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAdminMode(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  ← กลับหน้าเข้าสู่ระบบปกติ
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Dev hint */}
      {isDev && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-700">บัญชีทดสอบ (dev only)</p>
          {!adminMode ? (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => fillDev('public-owner', 'password')}
                className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono"
              >
                public-owner / password
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAdminData({ username: 'superadmin', password: 'ChangeMe-2026!', totpCode: '000000' })}
                className="block w-full text-left rounded-lg px-2 py-1 hover:bg-slate-100 font-mono"
              >
                superadmin / ChangeMe-2026! / 000000
              </button>
            </div>
          )}
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
