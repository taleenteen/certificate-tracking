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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AdminAccount {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  czpUserId: string;
  agencies: string[];
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

interface AdminFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: AdminAccount | null;
  onSave: (admin: AdminAccount) => void;
}

const AGENCIES = [
  { id: 'DIW', label: 'DIW (กรมโรงงานฯ)' },
  { id: 'ACFS', label: 'ACFS (มกอช.)' },
  { id: 'FDA', label: 'FDA (อย.)' },
  { id: 'DBD', label: 'DBD (กรมพัฒนาธุรกิจฯ)' },
  { id: 'MOL', label: 'MOL (กรมแรงงาน)' },
];

export function AdminFormModal({
  open,
  onOpenChange,
  admin,
  onSave,
}: AdminFormModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [czpUserId, setCzpUserId] = React.useState('');
  const [selectedAgencies, setSelectedAgencies] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<'Active' | 'Inactive'>('Active');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset or populate form when dialog opens/changes
  React.useEffect(() => {
    if (open) {
      if (admin) {
        setFullName(admin.fullName);
        setEmail(admin.email);
        setPhone(admin.phone || '');
        setCzpUserId(admin.czpUserId);
        setSelectedAgencies(admin.agencies || []);
        setStatus(admin.status);
      } else {
        setFullName('');
        setEmail('');
        setPhone('');
        setCzpUserId('');
        setSelectedAgencies([]);
        setStatus('Active');
      }
      setErrors({});
    }
  }, [open, admin]);

  const handleAgencyToggle = (agencyId: string) => {
    setSelectedAgencies((prev) =>
      prev.includes(agencyId)
        ? prev.filter((id) => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทร';
    if (!czpUserId.trim()) newErrors.czpUserId = 'กรุณากรอก czp_user_id';
    if (selectedAgencies.length === 0) {
      newErrors.agencies = 'กรุณาเลือกอย่างน้อย 1 หน่วยงาน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: admin?.id,
      fullName,
      email,
      phone,
      czpUserId,
      agencies: selectedAgencies,
      status,
      createdAt: admin?.createdAt,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-main text-left">
            {admin ? 'แก้ไขบัญชี Admin' : 'เพิ่มบัญชี Admin ใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[16px] text-left">
          {/* ชื่อ-นามสกุล */}
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
            {errors.fullName && (
              <p className="text-[11px] text-semantic-critical font-medium">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* อีเมล */}
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
              {errors.email && (
                <p className="text-[11px] text-semantic-critical font-medium">{errors.email}</p>
              )}
            </div>

            {/* เบอร์โทร */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-[13px] font-semibold text-main">
                เบอร์โทรศัพท์ <span className="text-semantic-critical">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="เช่น 0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? 'border-critical' : 'border-gray-200'}
              />
              {errors.phone && (
                <p className="text-[11px] text-semantic-critical font-medium">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* czp_user_id */}
          <div className="space-y-1">
            <Label htmlFor="czpUserId" className="text-[13px] font-semibold text-main">
              czp_user_id <span className="text-semantic-critical">*</span>
            </Label>
            <Input
              id="czpUserId"
              placeholder="เช่น CZP-00123"
              value={czpUserId}
              onChange={(e) => setCzpUserId(e.target.value)}
              className={errors.czpUserId ? 'border-critical' : 'border-gray-200'}
            />
            <p className="text-[11px] text-placeholder font-medium">
              * ยืนยัน czp_user_id จากระบบ mToken ของหน่วยงาน
            </p>
            {errors.czpUserId && (
              <p className="text-[11px] text-semantic-critical font-medium">{errors.czpUserId}</p>
            )}
          </div>

          {/* หน่วยงานในสังกัด (multi-select) */}
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-main">
              เลือกหน่วยงานในสังกัด (Multi-select) <span className="text-semantic-critical">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-md bg-fuji-light/20">
              {AGENCIES.map((agency) => (
                <div key={agency.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`agency-${agency.id}`}
                    checked={selectedAgencies.includes(agency.id)}
                    onCheckedChange={() => handleAgencyToggle(agency.id)}
                    className="border-gray-200 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                  />
                  <Label
                    htmlFor={`agency-${agency.id}`}
                    className="text-[12px] font-medium text-main cursor-pointer select-none"
                  >
                    {agency.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.agencies && (
              <p className="text-[11px] text-semantic-critical font-medium">{errors.agencies}</p>
            )}
          </div>

          {/* สถานะบัญชี */}
          <div className="space-y-1">
            <Label htmlFor="status" className="text-[13px] font-semibold text-main">
              สถานะบัญชี
            </Label>
            <Select
              value={status}
              onValueChange={(val: 'Active' | 'Inactive') => setStatus(val)}
            >
              <SelectTrigger id="status" className="w-full border-gray-200">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer Actions */}
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
              className="rounded-square bg-brand-primary hover:bg-brand-primary/95 text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low"
            >
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
