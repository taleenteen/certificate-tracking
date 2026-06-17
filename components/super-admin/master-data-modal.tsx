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

export type MasterDataCategory = 'agencies' | 'licenseTypes' | 'locations' | 'statuses';

export interface AgencyItem {
  id?: string;
  agencyCode: string;
  name: string;
  licenseTypes: string[];
  adminCount: number;
}

export interface LicenseTypeItem {
  id?: string;
  name: string;
  code: string;
  duration: string;
  agency: string;
  law: string;
}

export interface LocationItem {
  id?: string;
  code: string;
  province: string;
  zone: string;
  region: string;
}

export interface StatusItem {
  id?: string;
  statusCode: string;
  statusName: string;
  description: string;
  nextAction: string;
  color: 'success' | 'warning' | 'critical' | 'purple' | 'muted';
}

interface MasterDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: MasterDataCategory;
  item?: any | null;
  onSave: (item: any) => void;
  existingAgencies?: string[];
  existingLicenseTypes?: string[];
}

export function MasterDataModal({
  open,
  onOpenChange,
  category,
  item,
  onSave,
  existingAgencies = ['DIW', 'ACFS', 'FDA', 'DBD', 'MOL'],
  existingLicenseTypes = ['ร.ง.4', 'วัตถุอันตราย', 'ใบอนุญาตผลิต', 'ใบอนุญาตนำเข้า', 'GAP/HACCP', 'ใบสำคัญอาหาร', 'ใบทะเบียนพาณิชย์'],
}: MasterDataModalProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 1. Agency form states
  const [agencyCode, setAgencyCode] = React.useState('');
  const [agencyName, setAgencyName] = React.useState('');
  const [agencyLicenses, setAgencyLicenses] = React.useState<string[]>([]);
  const [agencyAdmins, setAgencyAdmins] = React.useState<number>(0);

  // 2. License type states
  const [licenseName, setLicenseName] = React.useState('');
  const [licenseCode, setLicenseCode] = React.useState('');
  const [licenseDuration, setLicenseDuration] = React.useState('');
  const [licenseAgency, setLicenseAgency] = React.useState('');
  const [licenseLaw, setLicenseLaw] = React.useState('');

  // 3. Location states
  const [locCode, setLocCode] = React.useState('');
  const [locProvince, setLocProvince] = React.useState('');
  const [locZone, setLocZone] = React.useState('');
  const [locRegion, setLocRegion] = React.useState('กลาง');

  // 4. Status states
  const [statusCode, setStatusCode] = React.useState('');
  const [statusName, setStatusName] = React.useState('');
  const [statusDesc, setStatusDesc] = React.useState('');
  const [statusNext, setStatusNext] = React.useState('');
  const [statusColor, setStatusColor] = React.useState<'success' | 'warning' | 'critical' | 'purple' | 'muted'>('muted');

  // Load/reset states
  React.useEffect(() => {
    if (open) {
      setErrors({});
      if (category === 'agencies') {
        setAgencyCode(item?.agencyCode || '');
        setAgencyName(item?.name || '');
        setAgencyLicenses(item?.licenseTypes || []);
        setAgencyAdmins(item?.adminCount || 0);
      } else if (category === 'licenseTypes') {
        setLicenseName(item?.name || '');
        setLicenseCode(item?.code || '');
        setLicenseDuration(item?.duration || '');
        setLicenseAgency(item?.agency || existingAgencies[0] || '');
        setLicenseLaw(item?.law || '');
      } else if (category === 'locations') {
        setLocCode(item?.code || '');
        setLocProvince(item?.province || '');
        setLocZone(item?.zone || '');
        setLocRegion(item?.region || 'กลาง');
      } else if (category === 'statuses') {
        setStatusCode(item?.statusCode || '');
        setStatusName(item?.statusName || '');
        setStatusDesc(item?.description || '');
        setStatusNext(item?.nextAction || '');
        setStatusColor(item?.color || 'muted');
      }
    }
  }, [open, category, item]);

  const handleLicenseToggle = (lic: string) => {
    setAgencyLicenses((prev) =>
      prev.includes(lic) ? prev.filter((x) => x !== lic) : [...prev, lic]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (category === 'agencies') {
      if (!agencyCode.trim()) newErrors.agencyCode = 'กรุณากรอกรหัสหน่วยงาน';
      if (!agencyName.trim()) newErrors.agencyName = 'กรุณากรอกชื่อหน่วยงาน';
    } else if (category === 'licenseTypes') {
      if (!licenseName.trim()) newErrors.licenseName = 'กรุณากรอกชื่อประเภทใบอนุญาต';
      if (!licenseCode.trim()) newErrors.licenseCode = 'กรุณากรอกรหัส';
      if (!licenseDuration.trim()) newErrors.licenseDuration = 'กรุณากรอกอายุใบอนุญาต';
    } else if (category === 'locations') {
      if (!locCode.trim()) newErrors.locCode = 'กรุณากรอกรหัส';
      if (!locProvince.trim()) newErrors.locProvince = 'กรุณากรอกจังหวัด';
      if (!locZone.trim()) newErrors.locZone = 'กรุณากรอกเขตพื้นที่';
    } else if (category === 'statuses') {
      if (!statusCode.trim()) newErrors.statusCode = 'กรุณากรอกรหัสสถานะ';
      if (!statusName.trim()) newErrors.statusName = 'กรุณากรอกชื่อสถานะ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let payload: any = { id: item?.id };

    if (category === 'agencies') {
      payload = {
        ...payload,
        agencyCode,
        name: agencyName,
        licenseTypes: agencyLicenses,
        adminCount: Number(agencyAdmins),
      };
    } else if (category === 'licenseTypes') {
      payload = {
        ...payload,
        name: licenseName,
        code: licenseCode,
        duration: licenseDuration,
        agency: licenseAgency,
        law: licenseLaw,
      };
    } else if (category === 'locations') {
      payload = {
        ...payload,
        code: locCode,
        province: locProvince,
        zone: locZone,
        region: locRegion,
      };
    } else if (category === 'statuses') {
      payload = {
        ...payload,
        statusCode,
        statusName,
        description: statusDesc,
        nextAction: statusNext,
        color: statusColor,
      };
    }

    onSave(payload);
    onOpenChange(false);
  };

  const getTitle = () => {
    const isEdit = !!item;
    switch (category) {
      case 'agencies':
        return isEdit ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มหน่วยงานใหม่';
      case 'licenseTypes':
        return isEdit ? 'แก้ไขประเภทใบอนุญาต' : 'เพิ่มประเภทใบอนุญาตใหม่';
      case 'locations':
        return isEdit ? 'แก้ไขจังหวัด/เขตพื้นที่' : 'เพิ่มจังหวัด/เขตพื้นที่ใหม่';
      case 'statuses':
        return isEdit ? 'แก้ไขสถานะ' : 'เพิ่มสถานะใหม่';
      default:
        return 'จัดการข้อมูลหลัก';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] rounded-square-hard border border-border-default shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-text-primary text-left">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[16px] text-left">
          {category === 'agencies' && (
            <>
              {/* Agency Form */}
              <div className="space-y-1">
                <Label htmlFor="agencyCode" className="text-[13px] font-semibold text-text-primary">
                  รหัสหน่วยงาน (agency_code) <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="agencyCode"
                  placeholder="เช่น DIW"
                  value={agencyCode}
                  onChange={(e) => setAgencyCode(e.target.value)}
                  className={errors.agencyCode ? 'border-border-critical' : 'border-border-neutral'}
                />
                {errors.agencyCode && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.agencyCode}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="agencyName" className="text-[13px] font-semibold text-text-primary">
                  ชื่อหน่วยงาน <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="agencyName"
                  placeholder="เช่น กรมโรงงานอุตสาหกรรม"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className={errors.agencyName ? 'border-border-critical' : 'border-border-neutral'}
                />
                {errors.agencyName && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.agencyName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-text-primary">
                  ประเภทใบอนุญาตที่รับผิดชอบ (เลือกได้หลายรายการ)
                </Label>
                <div className="grid grid-cols-2 gap-2 p-3 border border-border-neutral rounded-md bg-fuji-light/20 max-h-[140px] overflow-y-auto">
                  {existingLicenseTypes.map((lic) => (
                    <div key={lic} className="flex items-center gap-2">
                      <Checkbox
                        id={`lic-${lic}`}
                        checked={agencyLicenses.includes(lic)}
                        onCheckedChange={() => handleLicenseToggle(lic)}
                        className="border-border-neutral data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                      />
                      <Label
                        htmlFor={`lic-${lic}`}
                        className="text-[12px] font-medium text-text-primary cursor-pointer select-none"
                      >
                        {lic}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="agencyAdmins" className="text-[13px] font-semibold text-text-primary">
                  จำนวน Admin ที่ดูแล
                </Label>
                <Input
                  id="agencyAdmins"
                  type="number"
                  placeholder="0"
                  value={agencyAdmins}
                  onChange={(e) => setAgencyAdmins(Number(e.target.value))}
                  className="border-border-neutral"
                  min={0}
                />
              </div>
            </>
          )}

          {category === 'licenseTypes' && (
            <>
              {/* License Type Form */}
              <div className="space-y-1">
                <Label htmlFor="licenseName" className="text-[13px] font-semibold text-text-primary">
                  ชื่อประเภทใบอนุญาต <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="licenseName"
                  placeholder="เช่น ร.ง.4"
                  value={licenseName}
                  onChange={(e) => setLicenseName(e.target.value)}
                  className={errors.licenseName ? 'border-border-critical' : 'border-border-neutral'}
                />
                {errors.licenseName && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="licenseCode" className="text-[13px] font-semibold text-text-primary">
                    รหัส (code) <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="licenseCode"
                    placeholder="เช่น RNG4"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value)}
                    className={errors.licenseCode ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.licenseCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="licenseDuration" className="text-[13px] font-semibold text-text-primary">
                    อายุใบอนุญาต <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="licenseDuration"
                    placeholder="เช่น 5 ปี"
                    value={licenseDuration}
                    onChange={(e) => setLicenseDuration(e.target.value)}
                    className={errors.licenseDuration ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.licenseDuration && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseDuration}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="licenseAgency" className="text-[13px] font-semibold text-text-primary">
                  หน่วยงานที่รับผิดชอบ
                </Label>
                <Select value={licenseAgency} onValueChange={setLicenseAgency}>
                  <SelectTrigger id="licenseAgency" className="w-full border-border-neutral">
                    <SelectValue placeholder="เลือกหน่วยงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingAgencies.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="licenseLaw" className="text-[13px] font-semibold text-text-primary">
                  กฎหมายอ้างอิง
                </Label>
                <Input
                  id="licenseLaw"
                  placeholder="เช่น พรบ.โรงงาน 2535"
                  value={licenseLaw}
                  onChange={(e) => setLicenseLaw(e.target.value)}
                  className="border-border-neutral"
                />
              </div>
            </>
          )}

          {category === 'locations' && (
            <>
              {/* Location Form */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="locCode" className="text-[13px] font-semibold text-text-primary">
                    รหัส (code) <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="locCode"
                    placeholder="เช่น 10"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className={errors.locCode ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.locCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.locCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="locProvince" className="text-[13px] font-semibold text-text-primary">
                    จังหวัด <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="locProvince"
                    placeholder="เช่น กรุงเทพมหานคร"
                    value={locProvince}
                    onChange={(e) => setLocProvince(e.target.value)}
                    className={errors.locProvince ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.locProvince && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.locProvince}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="locZone" className="text-[13px] font-semibold text-text-primary">
                  เขตพื้นที่ <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="locZone"
                  placeholder="เช่น กทม. หรือ ปริมณฑล"
                  value={locZone}
                  onChange={(e) => setLocZone(e.target.value)}
                  className={errors.locZone ? 'border-border-critical' : 'border-border-neutral'}
                />
                {errors.locZone && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.locZone}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="locRegion" className="text-[13px] font-semibold text-text-primary">
                  ภาค
                </Label>
                <Select value={locRegion} onValueChange={setLocRegion}>
                  <SelectTrigger id="locRegion" className="w-full border-border-neutral">
                    <SelectValue placeholder="เลือกภาค" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="กลาง">กลาง</SelectItem>
                    <SelectItem value="เหนือ">เหนือ</SelectItem>
                    <SelectItem value="อีสาน">อีสาน</SelectItem>
                    <SelectItem value="ใต้">ใต้</SelectItem>
                    <SelectItem value="ตะวันออก">ตะวันออก</SelectItem>
                    <SelectItem value="ตะวันตก">ตะวันตก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {category === 'statuses' && (
            <>
              {/* Status Form */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="statusCode" className="text-[13px] font-semibold text-text-primary">
                    รหัสสถานะ <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="statusCode"
                    placeholder="เช่น PENDING"
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                    className={errors.statusCode ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.statusCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.statusCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="statusName" className="text-[13px] font-semibold text-text-primary">
                    ชื่อสถานะ <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="statusName"
                    placeholder="เช่น รออนุมัติ"
                    value={statusName}
                    onChange={(e) => setStatusName(e.target.value)}
                    className={errors.statusName ? 'border-border-critical' : 'border-border-neutral'}
                  />
                  {errors.statusName && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.statusName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="statusColor" className="text-[13px] font-semibold text-text-primary">
                  สีป้ายสถานะ (Badge Color)
                </Label>
                <Select
                  value={statusColor}
                  onValueChange={(val: any) => setStatusColor(val)}
                >
                  <SelectTrigger id="statusColor" className="w-full border-border-neutral">
                    <SelectValue placeholder="เลือกสีสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">เขียว (Success/Active)</SelectItem>
                    <SelectItem value="warning">เหลือง (Warning/Pending)</SelectItem>
                    <SelectItem value="critical">แดง (Critical/Rejected)</SelectItem>
                    <SelectItem value="purple">ม่วง (Purple/Suspended)</SelectItem>
                    <SelectItem value="muted">เทา (Gray/Expired)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="statusDesc" className="text-[13px] font-semibold text-text-primary">
                  คำอธิบายสถานะ
                </Label>
                <Input
                  id="statusDesc"
                  placeholder="เช่น ใบอนุญาตยื่นแล้ว รอเจ้าหน้าที่ตรวจสอบ"
                  value={statusDesc}
                  onChange={(e) => setStatusDesc(e.target.value)}
                  className="border-border-neutral"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="statusNext" className="text-[13px] font-semibold text-text-primary">
                  Next Action
                </Label>
                <Input
                  id="statusNext"
                  placeholder="เช่น ตรวจสอบเอกสาร"
                  value={statusNext}
                  onChange={(e) => setStatusNext(e.target.value)}
                  className="border-border-neutral"
                />
              </div>
            </>
          )}

          {/* Dialog Action Buttons */}
          <DialogFooter className="pt-2 gap-2 flex items-center justify-end sm:justify-end border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-square border-border-neutral text-text-primary hover:bg-fuji-light h-9 text-[13px] px-4 font-semibold"
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
