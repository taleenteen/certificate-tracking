'use client';

import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevLoginPage() {
  const login = useLogin();
  
  if (process.env.NEXT_PUBLIC_ENV !== 'development') {
    return <p>Unauthorized</p>;
  }

  type DevPayload =
    | { mToken: string }
    | { username: string; password: string }
    | { username: string; password: string; totpCode: string };

  const handleDevLogin = (type: 'tang-rat' | 'password' | 'self', payload: DevPayload) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login.mutate({ type, ...(payload as any) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Development Login (Seed Data)</CardTitle>
          <CardDescription>ทางลัดเข้าสู่ระบบสำหรับนักพัฒนาโดยใช้ข้อมูล Seed</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold">Tang Rat (mToken)</h3>
            <Button className="w-full justify-start" variant="secondary" onClick={() => handleDevLogin('tang-rat', { mToken: 'mock-public-owner' })}>
              Public Owner
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => handleDevLogin('tang-rat', { mToken: 'mock-inspector-1' })}>
              Inspector (DIW)
            </Button>
            <Button className="w-full justify-start" variant="secondary" onClick={() => handleDevLogin('tang-rat', { mToken: 'mock-supervisor-diw' })}>
              Supervisor (DIW)
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold">Password Login</h3>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleDevLogin('password', { username: 'public-owner', password: 'password' })}>
              Public (Password)
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleDevLogin('self', { username: 'admin', password: 'ChangeMe-2026!', totpCode: '000000' })}>
              Admin Self (TOTP)
            </Button>
          </div>
        </CardContent>
        {login.isPending && <p className="p-4 text-center animate-pulse">กำลังเข้าสู่ระบบ...</p>}
      </Card>
    </div>
  );
}
