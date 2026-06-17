'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useForceChangePassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const tempToken = useAuthStore((s) => s.pendingTempToken);
  const changePassword = useForceChangePassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirm?: string }>({});

  // If the user lands here without a pending token (e.g. direct navigation),
  // send them back to login.
  useEffect(() => {
    if (!tempToken) router.replace('/auth/login');
  }, [tempToken, router]);

  const validate = () => {
    const next: typeof errors = {};
    if (newPassword.length < 8) next.newPassword = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (newPassword !== confirm) next.confirm = 'รหัสผ่านไม่ตรงกัน';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    changePassword.mutate(newPassword);
  };

  if (!tempToken) return null;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-brand-surface p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
            <ShieldCheck className="size-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-main">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-sm text-placeholder text-center">
            บัญชีนี้ต้องเปลี่ยนรหัสผ่านก่อนเข้าใช้งาน
          </p>
        </div>

        <Card className="rounded-square-hard shadow-smooth-medium border-none overflow-hidden">
          <div className="h-2 bg-amber-500 w-full" />
          <CardHeader>
            <CardTitle className="text-amber-700 text-lg font-bold">เปลี่ยนรหัสผ่าน</CardTitle>
            <CardDescription>รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`rounded-square h-11 ${errors.newPassword ? 'border-red-400' : ''}`}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors.newPassword}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`rounded-square h-11 ${errors.confirm ? 'border-red-400' : ''}`}
                />
                {errors.confirm && (
                  <p className="text-xs text-red-500 font-medium">{errors.confirm}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-circle h-11 font-semibold mt-2"
              >
                {changePassword.isPending ? 'กำลังบันทึก...' : 'ยืนยันรหัสผ่านใหม่'}
              </Button>
            </form>

            {changePassword.isError && (
              <p className="text-sm text-red-500 text-center mt-3 font-medium">
                {changePassword.error instanceof Error
                  ? changePassword.error.message
                  : 'เกิดข้อผิดพลาด กรุณาลองใหม่'}
              </p>
            )}

            {changePassword.isSuccess && (
              <p className="text-sm text-green-600 text-center mt-3 font-medium">
                เปลี่ยนรหัสผ่านสำเร็จ กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
