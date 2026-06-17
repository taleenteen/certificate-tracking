'use client';

import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const register = useRegister();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(formData);
  };

  return (
    <Card className="rounded-square-hard shadow-smooth-medium border-none overflow-hidden">
      <div className="h-2 bg-brand-primary w-full" />
      <CardHeader>
        <CardTitle className="text-brand-primary text-2xl font-bold">สมัครสมาชิก</CardTitle>
        <CardDescription>กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
            <Input
              id="fullName"
              placeholder="สมชาย ใจดี"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="rounded-square h-11"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">ชื่อผู้ใช้งาน</Label>
              <Input
                id="username"
                placeholder="username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="rounded-square h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                placeholder="0812345678"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-square h-11"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="somchai@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-square h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-square h-11"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-circle h-12 text-lg mt-2"
            disabled={register.isPending}
          >
            {register.isPending ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
          </Button>
          
          <div className="text-center text-sm">
            มีบัญชีอยู่แล้ว?{' '}
            <button 
              type="button" 
              onClick={onToggle} 
              className="text-brand-primary font-semibold hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>
        {register.isError && (
          <p className="mt-4 text-sm text-destructive text-center font-medium bg-destructive/10 py-2 rounded-md">
            การลงทะเบียนล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง
          </p>
        )}
      </CardContent>
    </Card>
  );
}
