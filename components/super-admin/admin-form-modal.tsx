'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import type { SystemUserSummary } from '@/hooks/useUsers';
import { useAgencies } from '@/hooks/useAgencies';

export interface AdminFormData {
  fullName: string;
  email: string;
  phone: string;
  username?: string;
  agencyId: string;
  password?: string;
}

interface AdminFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: SystemUserSummary | null;
  onSave: (data: AdminFormData) => void;
  isSaving?: boolean;
}

export function AdminFormModal({ open, onOpenChange, user, onSave, isSaving }: AdminFormModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [agencyId, setAgencyId] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { data: agencies = [] } = useAgencies();

  React.useEffect(() => {
    if (open) {
      if (user) {
        setFullName(user.fullName);
        setEmail(user.email ?? '');
        setPhone(user.phone ?? '');
        setUsername(user.username ?? '');
        setAgencyId(user.agencyId ?? agencies[0]?.id ?? '');
      } else {
        setFullName('');
        setEmail('');
        setPhone('');
        setUsername('');
        setAgencyId(agencies[0]?.id ?? '');
      }
      setPassword('');
      setShowPassword(false);
      setErrors({});
    }
  }, [open, user]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!email.trim()) next.email = 'กรุณากรอกอีเมล';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (username.trim() && password && password.length < 8) next.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      fullName,
      email,
      phone,
      username: username || undefined,
      agencyId,
      password: username.trim() && password.trim() ? password : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-main text-left">
            {user ? 'แก้ไขบัญชี Admin' : 'เพิ่มบัญชี Admin ใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[16px] text-left">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-[13px] font-semibold text-main">
              ชื่อ-นามสกุล <span className="text-semantic-critical">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="เช่น สมชาย วงศ์ทอง"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? 'border-critical' : 'border-gray-200'}
            />
            {errors.fullName && <p className="text-[11px] text-semantic-critical font-medium">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[13px] font-semibold text-main">
                อีเมล <span className="text-semantic-critical">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="เช่น somchai@diw.go.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-critical' : 'border-gray-200'}
              />
              {errors.email && <p className="text-[11px] text-semantic-critical font-medium">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-[13px] font-semibold text-main">เบอร์โทร</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-[13px] font-semibold text-main">
                ชื่อผู้ใช้ (สำหรับ login)
              </Label>
              <Input
                id="username"
                placeholder="เช่น admin_diw_01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-gray-200"
              />
              <p className="text-[11px] text-placeholder">หากไม่กรอก จะใช้ mToken (Tang Rat)</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="agency" className="text-[13px] font-semibold text-main">หน่วยงาน</Label>
              <Select value={agencyId} onValueChange={setAgencyId}>
                <SelectTrigger id="agency" className="w-full border-gray-200">
                  <SelectValue placeholder="เลือกหน่วยงาน" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.code} — {a.nameTh}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {username.trim() && (
            <div className="space-y-1">
              <Label htmlFor="password" className="text-[13px] font-semibold text-main">
                รหัสผ่าน <span className="text-placeholder font-normal">(ถ้าไม่กรอก ระบบจะสร้างให้อัตโนมัติ)</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pr-10 ${errors.password ? 'border-critical' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-main transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-semantic-critical font-medium">{errors.password}</p>}
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 flex items-center justify-end sm:justify-end border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-square border-gray-200 text-main hover:bg-fuji-light h-9 text-[13px] px-4 font-semibold"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-square bg-brand-primary hover:bg-brand-primary/95 text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low"
            >
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
