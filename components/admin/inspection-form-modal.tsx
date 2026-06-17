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
import { MOCK_OFFICERS, type InspectionTask, type Inspector } from '@/constants/mock-inspections';

interface InspectionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: InspectionTask | null;
  onSave: (task: InspectionTask) => void;
}

export function InspectionFormModal({
  open,
  onOpenChange,
  task,
  onSave,
}: InspectionFormModalProps) {
  const [licenseNo, setLicenseNo] = React.useState('');
  const [licenseType, setLicenseType] = React.useState('รง.4');
  const [operatorName, setOperatorName] = React.useState('');
  const [assigneeId, setAssigneeId] = React.useState<string>('unassigned');
  const [inspectionDate, setInspectionDate] = React.useState('');
  const [status, setStatus] = React.useState<InspectionTask['status']>('WAITING_ASSIGNMENT');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset or populate form when dialog opens/changes
  React.useEffect(() => {
    if (open) {
      if (task) {
        setLicenseNo(task.licenseNo);
        setLicenseType(task.licenseType);
        setOperatorName(task.operatorName);
        setAssigneeId(task.assignee?.id || 'unassigned');
        setInspectionDate(task.inspectionDate);
        setStatus(task.status);
      } else {
        setLicenseNo('');
        setLicenseType('รง.4');
        setOperatorName('');
        setAssigneeId('unassigned');
        // Default to current date in dd/mm/yyyy format + 7 days
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        const day = String(defaultDate.getDate()).padStart(2, '0');
        const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const year = defaultDate.getFullYear() + 543; // Thai Buddhist year as screenshot has 2568
        setInspectionDate(`${day}/${month}/${year}`);
        setStatus('WAITING_ASSIGNMENT');
      }
      setErrors({});
    }
  }, [open, task]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!licenseNo.trim()) newErrors.licenseNo = 'กรุณากรอกเลขที่ใบอนุญาต';
    if (!operatorName.trim()) newErrors.operatorName = 'กรุณากรอกชื่อผู้ประกอบการ';
    if (!inspectionDate.trim()) {
      newErrors.inspectionDate = 'กรุณากรอกวันที่นัดตรวจ';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(inspectionDate)) {
      newErrors.inspectionDate = 'รูปแบบวันที่ไม่ถูกต้อง (ตัวอย่าง: 28/06/2568)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedOfficer = MOCK_OFFICERS.find((o) => o.id === assigneeId) || null;
    let finalStatus = status;
    
    // Auto-update status based on assignee selection
    if (selectedOfficer && status === 'WAITING_ASSIGNMENT') {
      finalStatus = 'ASSIGNED';
    } else if (!selectedOfficer && status === 'ASSIGNED') {
      finalStatus = 'WAITING_ASSIGNMENT';
    }

    onSave({
      id: task?.id || `INS-000${Math.floor(Math.random() * 900) + 100}`,
      licenseNo,
      licenseType,
      operatorName,
      assignee: selectedOfficer,
      inspectionDate,
      status: finalStatus,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-main text-left">
            {task ? 'แก้ไขข้อมูลงานตรวจสอบ' : 'สร้างงานตรวจสอบใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[16px] text-left">
          {/* เลขที่ใบอนุญาต */}
          <div className="space-y-1">
            <Label htmlFor="licenseNo" className="text-[13px] font-semibold text-main">
              เลขที่ใบอนุญาต <span className="text-semantic-critical">*</span>
            </Label>
            <Input
              id="licenseNo"
              placeholder="เช่น รง.4/2568/00123"
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              className={errors.licenseNo ? 'border-critical' : 'border-gray-200'}
            />
            {errors.licenseNo && (
              <p className="text-[11px] text-semantic-critical font-medium">{errors.licenseNo}</p>
            )}
          </div>

          {/* ประเภทใบอนุญาต */}
          <div className="space-y-1">
            <Label htmlFor="licenseType" className="text-[13px] font-semibold text-main">
              ประเภทใบอนุญาต
            </Label>
            <Select value={licenseType} onValueChange={setLicenseType}>
              <SelectTrigger id="licenseType" className="w-full border-gray-200">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="รง.4">รง.4 (ใบอนุญาตประกอบกิจการโรงงาน)</SelectItem>
                <SelectItem value="วัตถุอันตราย">วัตถุอันตราย (ใบอนุญาตวัตถุอันตราย)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ชื่อผู้ประกอบการ */}
          <div className="space-y-1">
            <Label htmlFor="operatorName" className="text-[13px] font-semibold text-main">
              ชื่อผู้ประกอบการ <span className="text-semantic-critical">*</span>
            </Label>
            <Input
              id="operatorName"
              placeholder="เช่น บริษัท ไทยโลหะ จำกัด"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className={errors.operatorName ? 'border-critical' : 'border-gray-200'}
            />
            {errors.operatorName && (
              <p className="text-[11px] text-semantic-critical font-medium">{errors.operatorName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* วันที่นัดตรวจ */}
            <div className="space-y-1">
              <Label htmlFor="inspectionDate" className="text-[13px] font-semibold text-main">
                วันที่นัดตรวจ <span className="text-semantic-critical">*</span>
              </Label>
              <Input
                id="inspectionDate"
                placeholder="เช่น 28/06/2568"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className={errors.inspectionDate ? 'border-critical' : 'border-gray-200'}
              />
              {errors.inspectionDate && (
                <p className="text-[11px] text-semantic-critical font-medium">{errors.inspectionDate}</p>
              )}
            </div>

            {/* สถานะ */}
            <div className="space-y-1">
              <Label htmlFor="status" className="text-[13px] font-semibold text-main">
                สถานะ
              </Label>
              <Select
                value={status}
                onValueChange={(val: InspectionTask['status']) => setStatus(val)}
              >
                <SelectTrigger id="status" className="w-full border-gray-200">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAITING_ASSIGNMENT">รอการมอบหมาย</SelectItem>
                  <SelectItem value="ASSIGNED">มอบหมายแล้ว</SelectItem>
                  <SelectItem value="IN_PROGRESS">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                  <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* เจ้าหน้าที่ที่รับผิดชอบ */}
          <div className="space-y-1">
            <Label htmlFor="assignee" className="text-[13px] font-semibold text-main">
              เจ้าหน้าที่ที่รับผิดชอบ
            </Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee" className="w-full border-gray-200">
                <SelectValue placeholder="เลือกเจ้าหน้าที่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">ยังไม่ได้มอบหมาย</SelectItem>
                {MOCK_OFFICERS.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.name}
                  </SelectItem>
                ))}
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
              {task ? 'บันทึกการแก้ไข' : 'สร้างงานตรวจสอบ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
