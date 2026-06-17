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
import type { AgencyRecord } from '@/hooks/useAgencies';
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
  code: string;
  nameTh: string;
  nameEn?: string;
  dataSource: 'API' | 'MANUAL_IMPORT';
  apiStatus: 'CONNECTED' | 'MANUAL' | 'DISCONNECTED';
  isActive?: boolean;
}

export interface LicenseTypeItem {
  id?: string;
  name: string;
  code: string;
  duration: string;
  agencyId: string;
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
  agencies?: AgencyRecord[];
  existingLicenseTypes?: string[];
}

export function MasterDataModal({
  open,
  onOpenChange,
  category,
  item,
  onSave,
  agencies = [],
  existingLicenseTypes = [],
}: MasterDataModalProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 1. Agency form states
  const [agencyCode, setAgencyCode] = React.useState('');
  const [agencyNameTh, setAgencyNameTh] = React.useState('');
  const [agencyNameEn, setAgencyNameEn] = React.useState('');
  const [agencyDataSource, setAgencyDataSource] = React.useState<'API' | 'MANUAL_IMPORT'>('MANUAL_IMPORT');
  const [agencyApiStatus, setAgencyApiStatus] = React.useState<'CONNECTED' | 'MANUAL' | 'DISCONNECTED'>('MANUAL');
  const [agencyIsActive, setAgencyIsActive] = React.useState(true);

  // 2. License type states
  const [licenseName, setLicenseName] = React.useState('');
  const [licenseCode, setLicenseCode] = React.useState('');
  const [licenseDuration, setLicenseDuration] = React.useState('');
  const [licenseAgencyId, setLicenseAgencyId] = React.useState('');
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
        setAgencyCode(item?.code || '');
        setAgencyNameTh(item?.nameTh || '');
        setAgencyNameEn(item?.nameEn || '');
        setAgencyDataSource(item?.dataSource || 'MANUAL_IMPORT');
        setAgencyApiStatus(item?.apiStatus || 'MANUAL');
        setAgencyIsActive(item?.isActive !== undefined ? item.isActive : true);
      } else if (category === 'licenseTypes') {
        setLicenseName(item?.name || '');
        setLicenseCode(item?.code || '');
        setLicenseDuration(item?.duration || '');
        setLicenseAgencyId(item?.agencyId || agencies[0]?.id || '');
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (category === 'agencies') {
      if (!agencyCode.trim()) newErrors.agencyCode = 'กรุณากรอกรหัสหน่วยงาน';
      if (!agencyNameTh.trim()) newErrors.agencyNameTh = 'กรุณากรอกชื่อหน่วยงาน';
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
        code: agencyCode,
        nameTh: agencyNameTh,
        nameEn: agencyNameEn || undefined,
        dataSource: agencyDataSource,
        apiStatus: agencyApiStatus,
        isActive: agencyIsActive,
      };
    } else if (category === 'licenseTypes') {
      payload = {
        ...payload,
        name: licenseName,
        code: licenseCode,
        duration: licenseDuration,
        agencyId: licenseAgencyId,
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
      <DialogContent className="max-w-[500px] rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-main text-left">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[16px] text-left">
          {category === 'agencies' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="agencyCode" className="text-[13px] font-semibold text-main">
                  รหัสหน่วยงาน (code) <span className="text-semantic-critical">*</span>
                  {item?.id && <span className="ml-1 text-[11px] text-placeholder font-normal">(แก้ไขไม่ได้)</span>}
                </Label>
                <Input
                  id="agencyCode"
                  placeholder="เช่น DIW"
                  value={agencyCode}
                  onChange={(e) => setAgencyCode(e.target.value.toUpperCase())}
                  disabled={!!item?.id}
                  className={errors.agencyCode ? 'border-critical' : 'border-gray-200'}
                />
                {errors.agencyCode && <p className="text-[11px] text-semantic-critical font-medium">{errors.agencyCode}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="agencyNameTh" className="text-[13px] font-semibold text-main">
                  ชื่อหน่วยงาน (ภาษาไทย) <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="agencyNameTh"
                  placeholder="เช่น กรมโรงงานอุตสาหกรรม"
                  value={agencyNameTh}
                  onChange={(e) => setAgencyNameTh(e.target.value)}
                  className={errors.agencyNameTh ? 'border-critical' : 'border-gray-200'}
                />
                {errors.agencyNameTh && <p className="text-[11px] text-semantic-critical font-medium">{errors.agencyNameTh}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="agencyNameEn" className="text-[13px] font-semibold text-main">ชื่อหน่วยงาน (ภาษาอังกฤษ)</Label>
                <Input id="agencyNameEn" placeholder="e.g. Department of Industrial Works" value={agencyNameEn} onChange={(e) => setAgencyNameEn(e.target.value)} className="border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[13px] font-semibold text-main">แหล่งข้อมูล</Label>
                  <Select value={agencyDataSource} onValueChange={(v: any) => setAgencyDataSource(v)}>
                    <SelectTrigger className="w-full border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API">API (Real-time)</SelectItem>
                      <SelectItem value="MANUAL_IMPORT">CSV Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[13px] font-semibold text-main">สถานะ API</Label>
                  <Select value={agencyApiStatus} onValueChange={(v: any) => setAgencyApiStatus(v)}>
                    <SelectTrigger className="w-full border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONNECTED">เชื่อมต่อแล้ว</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="DISCONNECTED">ขาดการเชื่อมต่อ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {item?.id && (
                <div className="space-y-1">
                  <Label className="text-[13px] font-semibold text-main">สถานะการใช้งาน</Label>
                  <Select value={agencyIsActive ? 'true' : 'false'} onValueChange={(v) => setAgencyIsActive(v === 'true')}>
                    <SelectTrigger className="w-full border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {category === 'licenseTypes' && (
            <>
              {/* License Type Form */}
              <div className="space-y-1">
                <Label htmlFor="licenseName" className="text-[13px] font-semibold text-main">
                  ชื่อประเภทใบอนุญาต <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="licenseName"
                  placeholder="เช่น ร.ง.4"
                  value={licenseName}
                  onChange={(e) => setLicenseName(e.target.value)}
                  className={errors.licenseName ? 'border-critical' : 'border-gray-200'}
                />
                {errors.licenseName && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="licenseCode" className="text-[13px] font-semibold text-main">
                    รหัส (code) <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="licenseCode"
                    placeholder="เช่น RNG4"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value)}
                    className={errors.licenseCode ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.licenseCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="licenseDuration" className="text-[13px] font-semibold text-main">
                    อายุใบอนุญาต <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="licenseDuration"
                    placeholder="เช่น 5 ปี"
                    value={licenseDuration}
                    onChange={(e) => setLicenseDuration(e.target.value)}
                    className={errors.licenseDuration ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.licenseDuration && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseDuration}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="licenseAgency" className="text-[13px] font-semibold text-main">
                  หน่วยงานที่รับผิดชอบ
                </Label>
                <Select value={licenseAgencyId} onValueChange={setLicenseAgencyId}>
                  <SelectTrigger id="licenseAgency" className="w-full border-gray-200">
                    <SelectValue placeholder="เลือกหน่วยงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} — {a.nameTh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="licenseLaw" className="text-[13px] font-semibold text-main">
                  กฎหมายอ้างอิง
                </Label>
                <Input
                  id="licenseLaw"
                  placeholder="เช่น พรบ.โรงงาน 2535"
                  value={licenseLaw}
                  onChange={(e) => setLicenseLaw(e.target.value)}
                  className="border-gray-200"
                />
              </div>
            </>
          )}

          {category === 'locations' && (
            <>
              {/* Location Form */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="locCode" className="text-[13px] font-semibold text-main">
                    รหัส (code) <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="locCode"
                    placeholder="เช่น 10"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className={errors.locCode ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.locCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.locCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="locProvince" className="text-[13px] font-semibold text-main">
                    จังหวัด <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="locProvince"
                    placeholder="เช่น กรุงเทพมหานคร"
                    value={locProvince}
                    onChange={(e) => setLocProvince(e.target.value)}
                    className={errors.locProvince ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.locProvince && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.locProvince}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="locZone" className="text-[13px] font-semibold text-main">
                  เขตพื้นที่ <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="locZone"
                  placeholder="เช่น กทม. หรือ ปริมณฑล"
                  value={locZone}
                  onChange={(e) => setLocZone(e.target.value)}
                  className={errors.locZone ? 'border-critical' : 'border-gray-200'}
                />
                {errors.locZone && (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.locZone}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="locRegion" className="text-[13px] font-semibold text-main">
                  ภาค
                </Label>
                <Select value={locRegion} onValueChange={setLocRegion}>
                  <SelectTrigger id="locRegion" className="w-full border-gray-200">
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
                  <Label htmlFor="statusCode" className="text-[13px] font-semibold text-main">
                    รหัสสถานะ <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="statusCode"
                    placeholder="เช่น PENDING"
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                    className={errors.statusCode ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.statusCode && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.statusCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="statusName" className="text-[13px] font-semibold text-main">
                    ชื่อสถานะ <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="statusName"
                    placeholder="เช่น รออนุมัติ"
                    value={statusName}
                    onChange={(e) => setStatusName(e.target.value)}
                    className={errors.statusName ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.statusName && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.statusName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="statusColor" className="text-[13px] font-semibold text-main">
                  สีป้ายสถานะ (Badge Color)
                </Label>
                <Select
                  value={statusColor}
                  onValueChange={(val: any) => setStatusColor(val)}
                >
                  <SelectTrigger id="statusColor" className="w-full border-gray-200">
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
                <Label htmlFor="statusDesc" className="text-[13px] font-semibold text-main">
                  คำอธิบายสถานะ
                </Label>
                <Input
                  id="statusDesc"
                  placeholder="เช่น ใบอนุญาตยื่นแล้ว รอเจ้าหน้าที่ตรวจสอบ"
                  value={statusDesc}
                  onChange={(e) => setStatusDesc(e.target.value)}
                  className="border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="statusNext" className="text-[13px] font-semibold text-main">
                  Next Action
                </Label>
                <Input
                  id="statusNext"
                  placeholder="เช่น ตรวจสอบเอกสาร"
                  value={statusNext}
                  onChange={(e) => setStatusNext(e.target.value)}
                  className="border-gray-200"
                />
              </div>
            </>
          )}

          {/* Dialog Action Buttons */}
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
