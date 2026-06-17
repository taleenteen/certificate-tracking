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
import { toast } from 'sonner';
import { useCreateTask, useAssignTask, type InspectionTaskSummary } from '@/hooks/useInspectionTasks';
import { useUsers } from '@/hooks/useUsers';

interface CreateModeProps {
  mode: 'create';
  task?: never;
}

interface AssignModeProps {
  mode: 'assign';
  task: InspectionTaskSummary;
}

type InspectionFormModalProps = (CreateModeProps | AssignModeProps) & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InspectionFormModal({ open, onOpenChange, mode, task }: InspectionFormModalProps) {
  const { data: inspectors = [] } = useUsers({ role: 'inspector' });

  // Create-mode fields
  const [businessId, setBusinessId] = React.useState('');
  const [licenseId, setLicenseId] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [assigneeId, setAssigneeId] = React.useState('unassigned');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createTask = useCreateTask();
  const assignTask = useAssignTask(task?.id ?? '');

  React.useEffect(() => {
    if (open) {
      setBusinessId('');
      setLicenseId('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().slice(0, 10));
      setAssigneeId('unassigned');
      setErrors({});
    }
  }, [open]);

  /* ── Create mode ─────────────────────────────────────── */
  const validateCreate = () => {
    const next: Record<string, string> = {};
    if (!businessId.trim()) next.businessId = 'กรุณากรอกรหัสกิจการ (UUID)';
    else if (!/^[0-9a-f-]{36}$/i.test(businessId.trim())) next.businessId = 'รูปแบบ UUID ไม่ถูกต้อง';
    if (!dueDate) next.dueDate = 'กรุณาเลือกวันที่นัดตรวจ';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;
    createTask.mutate(
      {
        businessId: businessId.trim(),
        licenseId: licenseId.trim() || undefined,
        assignedTo: assigneeId !== 'unassigned' ? assigneeId : undefined,
        dueDate: dueDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success('สร้างงานตรวจสอบสำเร็จ');
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err?.message ?? 'ไม่สามารถสร้างงานตรวจสอบได้'),
      },
    );
  };

  /* ── Assign mode ─────────────────────────────────────── */
  const [assignTo, setAssignTo] = React.useState('');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTo) {
      toast.error('กรุณาเลือกเจ้าหน้าที่');
      return;
    }
    assignTask.mutate(
      { assignedTo: assignTo },
      {
        onSuccess: () => {
          toast.success('มอบหมายเจ้าหน้าที่สำเร็จ');
          onOpenChange(false);
        },
        onError: (err: any) => toast.error(err?.message ?? 'ไม่สามารถมอบหมายได้'),
      },
    );
  };

  /* ── Shared render ───────────────────────────────────── */
  const isPending = mode === 'create' ? createTask.isPending : assignTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-[18px] font-bold text-main text-left">
            {mode === 'create' ? 'สร้างงานตรวจสอบใหม่' : 'มอบหมายเจ้าหน้าที่'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'assign' && task && (
          <div className="mb-4 p-3 bg-fuji-light/30 rounded-[8px] border border-gray-200 text-left space-y-1">
            <p className="text-[12px] text-placeholder font-medium">งาน: <span className="text-main font-bold">{task.taskNo}</span></p>
            <p className="text-[12px] text-placeholder font-medium">กิจการ: <span className="text-main font-bold">{task.business.nameTh}</span></p>
            {task.license && (
              <p className="text-[12px] text-placeholder font-medium">ใบอนุญาต: <span className="text-main font-bold">{task.license.licenseNumber}</span></p>
            )}
          </div>
        )}

        <form onSubmit={mode === 'create' ? handleCreate : handleAssign} className="space-y-[16px] text-left">
          {mode === 'create' ? (
            <>
              {/* Business UUID */}
              <div className="space-y-1">
                <Label htmlFor="businessId" className="text-[13px] font-semibold text-main">
                  รหัสกิจการ (UUID) <span className="text-semantic-critical">*</span>
                </Label>
                <Input
                  id="businessId"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className={`font-mono text-[12px] ${errors.businessId ? 'border-critical' : 'border-gray-200'}`}
                />
                {errors.businessId ? (
                  <p className="text-[11px] text-semantic-critical font-medium">{errors.businessId}</p>
                ) : (
                  <p className="text-[11px] text-placeholder">UUID ของกิจการที่ต้องการสร้างงานตรวจสอบ</p>
                )}
              </div>

              {/* License UUID (optional) */}
              <div className="space-y-1">
                <Label htmlFor="licenseId" className="text-[13px] font-semibold text-main">
                  รหัสใบอนุญาต (UUID, ไม่บังคับ)
                </Label>
                <Input
                  id="licenseId"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                  className="font-mono text-[12px] border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Due Date */}
                <div className="space-y-1">
                  <Label htmlFor="dueDate" className="text-[13px] font-semibold text-main">
                    วันที่นัดตรวจ <span className="text-semantic-critical">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={errors.dueDate ? 'border-critical' : 'border-gray-200'}
                  />
                  {errors.dueDate && (
                    <p className="text-[11px] text-semantic-critical font-medium">{errors.dueDate}</p>
                  )}
                </div>

                {/* Assignee (optional — if none → WAITING_ASSIGNMENT) */}
                <div className="space-y-1">
                  <Label htmlFor="assignee" className="text-[13px] font-semibold text-main">เจ้าหน้าที่ผู้รับผิดชอบ</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="assignee" className="w-full border-gray-200">
                      <SelectValue placeholder="เลือกเจ้าหน้าที่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">รอมอบหมาย</SelectItem>
                      {inspectors.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-placeholder">หากไม่เลือก จะเป็นสถานะ &ldquo;รอมอบหมาย&rdquo;</p>
                </div>
              </div>
            </>
          ) : (
            /* Assign mode: inspector select only */
            <div className="space-y-1">
              <Label htmlFor="assignTo" className="text-[13px] font-semibold text-main">
                เจ้าหน้าที่ผู้รับผิดชอบ <span className="text-semantic-critical">*</span>
              </Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger id="assignTo" className="w-full border-gray-200">
                  <SelectValue placeholder="เลือกเจ้าหน้าที่" />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.length === 0 && (
                    <SelectItem value="__none" disabled>ไม่มีเจ้าหน้าที่ในระบบ</SelectItem>
                  )}
                  {inspectors.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={isPending}
              className="rounded-square bg-brand-primary hover:bg-brand-primary/95 text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low"
            >
              {isPending
                ? 'กำลังบันทึก...'
                : mode === 'create'
                ? 'สร้างงานตรวจสอบ'
                : 'ยืนยันการมอบหมาย'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
