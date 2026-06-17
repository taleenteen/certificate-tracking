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
import { useCreateTask, useAssignTask, useInspectionTasks, type InspectionTaskSummary } from '@/hooks/useInspectionTasks';
import { useUsers } from '@/hooks/useUsers';
import { useAdminBusinesses } from '@/hooks/useBusinesses';
import { useAuthStore } from '@/stores/auth';
import { useAgencies } from '@/hooks/useAgencies';
import { Check, Search, FileText, AlertCircle, ChevronLeft } from 'lucide-react';

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

const getLicenseTypeDisplay = (code: string, nameTh: string) => {
  if (code === 'RNG4') return 'ร.ง.4';
  if (code === 'HAZMAT') return 'วัตถุอันตราย';
  return nameTh;
};

const getLoadInfo = (count: number) => {
  if (count >= 5) {
    return {
      badgeBg: 'bg-amber-100 text-amber-800',
      barBg: 'bg-amber-500',
    };
  }
  return {
    badgeBg: 'bg-emerald-100 text-emerald-800',
    barBg: 'bg-emerald-500',
  };
};

const getOfficerZonesDisplay = (userZones: any[]) => {
  if (!userZones || userZones.length === 0) return 'ไม่ระบุพื้นที่';
  return userZones.map((uz) => {
    const code = uz.zone.code;
    if (code === 'Z-BKK') return 'กทม.';
    if (code === 'Z-CMI') return 'เชียงใหม่';
    if (code === 'Z-CBI') return 'ชลบุรี';
    if (code === 'Z-KKN') return 'ขอนแก่น';
    if (code === 'Z-SKA') return 'สงขลา';
    if (code === 'Z-NMA') return 'นครราชสีมา';
    return uz.zone.nameTh;
  }).join(', ');
};

export function InspectionFormModal({ open, onOpenChange, mode, task }: InspectionFormModalProps) {
  const user = useAuthStore((s) => s.user);
  const { data: agencies = [] } = useAgencies();
  const userAgency = agencies.find((a) => a.id === user?.agencyId);

  const { data: inspectors = [] } = useUsers({ role: 'officer' });
  const { data: allTasks = [] } = useInspectionTasks();

  // Create-mode fields
  const [dueDate, setDueDate] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Assign-mode fields
  const [assignTo, setAssignTo] = React.useState('');

  // Wizard steps state (only for create mode)
  const [step, setStep] = React.useState(1);
  const [success, setSuccess] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLicense, setSelectedLicense] = React.useState<{
    licenseId: string;
    licenseNo: string;
    licenseCode: string;
    businessId: string;
    businessName: string;
    province: string;
  } | null>(null);
  const [timePeriod, setTimePeriod] = React.useState('10:00–12:00');
  const [selectedOfficer, setSelectedOfficer] = React.useState<any | null>(null);

  const createTask = useCreateTask();
  const assignTask = useAssignTask(task?.id ?? '');

  // Fetch businesses for selection in Step 1
  const { data: businessesResponse, isLoading: isBusinessesLoading } = useAdminBusinesses(searchQuery);
  const businesses = businessesResponse?.data ?? [];

  React.useEffect(() => {
    if (open) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().slice(0, 10));
      setErrors({});
      
      // Reset wizard states
      setStep(1);
      setSuccess(false);
      setSearchQuery('');
      setSelectedLicense(null);
      setTimePeriod('10:00–12:00');
      setSelectedOfficer(null);

      if (mode === 'assign' && task) {
        setAssignTo(task.assignee?.id ?? '');
      } else {
        setAssignTo('');
      }
    }
  }, [open, mode, task]);

  // Flatten & filter active licenses matching the supervisor's agency
  const filteredLicenses = React.useMemo(() => {
    const list: Array<{
      licenseId: string;
      licenseNo: string;
      licenseCode: string;
      licenseTypeName: string;
      businessId: string;
      businessName: string;
      province: string;
    }> = [];

    businesses.forEach((b) => {
      b.licenses.forEach((lic) => {
        if (!userAgency || lic.licenseType.agencyId === userAgency.id) {
          list.push({
            licenseId: lic.id,
            licenseNo: lic.licenseNumber,
            licenseCode: lic.licenseType.code,
            licenseTypeName: lic.licenseType.nameTh,
            businessId: b.id,
            businessName: b.nameTh,
            province: b.province ?? 'กรุงเทพมหานคร',
          });
        }
      });
    });

    return list;
  }, [businesses, userAgency]);

  // Get active workload count for officers
  const getOfficerWorkload = React.useCallback((officerId: string) => {
    return allTasks.filter(
      (t) => t.assignee?.id === officerId && t.status !== 'APPROVED' && t.status !== 'CANCELLED'
    ).length;
  }, [allTasks]);

  /* ── Re-assignment mode submit (Single Step) ─────────── */
  const handleAssignSubmit = (e: React.FormEvent) => {
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

  /* ── Wizard creation mode submit ────────────────────── */
  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense || !dueDate || !selectedOfficer) {
      toast.error('ข้อมูลไม่ครบถ้วน');
      return;
    }

    createTask.mutate(
      {
        businessId: selectedLicense.businessId,
        licenseId: selectedLicense.licenseId,
        assignedTo: selectedOfficer.id,
        dueDate: dueDate,
      },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'ไม่สามารถสร้างงานตรวจสอบได้');
        },
      }
    );
  };

  const isPending = mode === 'create' ? createTask.isPending : assignTask.isPending;
  const displayAgency = userAgency?.nameTh ?? 'กรมโรงงานอุตสาหกรรม (DIW)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${mode === 'create' ? 'max-w-[600px]' : 'max-w-[500px]'} rounded-square-hard border border-gray-200 shadow-smooth-medium bg-background p-6`}>
        <DialogHeader className="mb-2 text-left">
          <DialogTitle className="text-[18px] font-bold text-main">
            {mode === 'create' ? 'สร้างงานตรวจสอบใหม่' : 'มอบหมายเจ้าหน้าที่'}
          </DialogTitle>
          {mode === 'create' && (
            <p className="text-[12px] text-placeholder font-medium mt-0.5">{displayAgency}</p>
          )}
        </DialogHeader>

        {/* ── MODE: ASSIGN (Single Step Dropdown) ─────────── */}
        {mode === 'assign' && task && (
          <form onSubmit={handleAssignSubmit} className="space-y-[16px] text-left">
            <div className="p-3 bg-fuji-light/30 rounded-[8px] border border-gray-200 space-y-1">
              <p className="text-[12px] text-placeholder font-medium">งาน: <span className="text-main font-bold">{task.taskNo}</span></p>
              <p className="text-[12px] text-placeholder font-medium">กิจการ: <span className="text-main font-bold">{task.business.nameTh}</span></p>
              {task.license && (
                <p className="text-[12px] text-placeholder font-medium">ใบอนุญาต: <span className="text-main font-bold">{task.license.licenseNumber}</span></p>
              )}
            </div>

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

            <DialogFooter className="pt-2 gap-2 border-t border-gray-200">
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
                {isPending ? 'กำลังบันทึก...' : 'ยืนยันการมอบหมาย'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ── MODE: CREATE (3-Step Wizard) ───────────────── */}
        {mode === 'create' && (
          <div className="space-y-4">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-6 relative px-4 select-none">
              {/* Connecting line */}
              <div className="absolute left-[50px] right-[50px] top-[18px] h-[3px] bg-gray-200 -z-10" />
              <div 
                className="absolute top-[18px] h-[3px] bg-emerald-500 transition-all duration-300 -z-10" 
                style={{ 
                  left: '50px',
                  right: success || step === 3 ? '50px' : step === 2 ? '50%' : 'calc(100% - 50px)'
                }} 
              />

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > 1 || success
                    ? 'bg-emerald-500 text-white' 
                    : step === 1 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > 1 || success ? <Check className="size-4" strokeWidth={3} /> : '1'}
                </div>
                <span className={`text-[12px] font-bold transition-all duration-300 ${
                  step >= 1 ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  เลือกใบอนุญาต
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > 2 || success
                    ? 'bg-emerald-500 text-white' 
                    : step === 2 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > 2 || success ? <Check className="size-4" strokeWidth={3} /> : '2'}
                </div>
                <span className={`text-[12px] font-bold transition-all duration-300 ${
                  step >= 2 ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  นัดหมาย & เจ้าหน้าที่
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 3 && !success
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                    : success
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {success ? <Check className="size-4" strokeWidth={3} /> : '3'}
                </div>
                <span className={`text-[12px] font-bold transition-all duration-300 ${
                  step === 3 || success ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  ยืนยัน
                </span>
              </div>
            </div>

            {/* Wizard Body Content */}
            {success ? (
              /* Success Screen */
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Check className="size-8 animate-in zoom-in duration-300" strokeWidth={3} />
                </div>
                <h3 className="text-[18px] font-bold text-emerald-800">มอบหมายงานสำเร็จแล้ว</h3>
                <p className="text-[13px] text-placeholder">งานใหม่ถูกเพิ่มในรายการแดชบอร์ดเรียบร้อย</p>
              </div>
            ) : step === 1 ? (
              /* Step 1 Content */
              <div className="space-y-3 text-left">
                <p className="text-[13px] font-semibold text-main">
                  เลือกใบอนุญาตที่ต้องการสั่งตรวจสอบ (ร.ง.4 / วัตถุอันตราย)
                </p>

                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-placeholder" />
                  <Input
                    placeholder="ค้นหาเลขที่ใบอนุญาต / ชื่อผู้ประกอบการ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full border-gray-200 text-[13px] h-10 rounded-[8px]"
                  />
                </div>

                {/* Cards List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {isBusinessesLoading ? (
                    <p className="text-center py-8 text-[13px] text-placeholder">กำลังโหลด...</p>
                  ) : filteredLicenses.length === 0 ? (
                    <p className="text-center py-8 text-[13px] text-placeholder">ไม่พบใบอนุญาตที่เข้าเกณฑ์</p>
                  ) : (
                    filteredLicenses.map((lic) => {
                      const isSelected = selectedLicense?.licenseId === lic.licenseId;
                      return (
                        <div
                          key={lic.licenseId}
                          onClick={() => setSelectedLicense(lic)}
                          className={`p-3.5 border rounded-[8px] cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/10 shadow-smooth-low' 
                              : 'border-gray-200 hover:bg-fuji-light/40 bg-white'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[13px] font-bold text-emerald-600 font-mono">
                              {lic.licenseNo}
                            </span>
                            <h4 className="text-[13px] font-bold text-main">
                              {lic.businessName}
                            </h4>
                            <p className="text-[11px] text-placeholder font-medium">
                              {lic.province} · {getLicenseTypeDisplay(lic.licenseCode, lic.licenseTypeName)}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="size-3" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : step === 2 ? (
              /* Step 2 Content */
              <div className="space-y-4 text-left">
                {/* Selected License Card Info */}
                {selectedLicense && (
                  <div className="p-3 bg-fuji-light/30 rounded-[8px] border border-gray-200 flex items-center gap-2.5">
                    <FileText className="size-5 text-emerald-600 shrink-0" />
                    <p className="text-[12px] text-placeholder font-medium leading-normal">
                      ใบอนุญาตที่เลือก: <span className="text-emerald-700 font-bold font-mono">{selectedLicense.licenseNo}</span> — <span className="text-main font-bold">{selectedLicense.businessName}</span>
                    </p>
                  </div>
                )}

                {/* Scheduling inputs */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-bold text-main">กำหนดวันเวลานัดตรวจ <span className="text-semantic-critical">*</span></h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dueDate" className="text-[11px] font-semibold text-placeholder">วันที่นัดตรวจ</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border-gray-200 h-9 text-[13px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="timePeriod" className="text-[11px] font-semibold text-placeholder">ช่วงเวลา</Label>
                      <Select value={timePeriod} onValueChange={setTimePeriod}>
                        <SelectTrigger id="timePeriod" className="w-full border-gray-200 h-9 text-[13px] bg-white">
                          <SelectValue placeholder="เลือกช่วงเวลา" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10:00–12:00">10:00–12:00</SelectItem>
                          <SelectItem value="13:00–15:00">13:00–15:00</SelectItem>
                          <SelectItem value="15:00–17:00">15:00–17:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Officer selection */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-bold text-main">เลือกเจ้าหน้าที่ที่รับผิดชอบ <span className="text-semantic-critical">*</span></h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {inspectors.length === 0 ? (
                      <p className="text-center py-4 text-[13px] text-placeholder">ไม่มีเจ้าหน้าที่ในสังกัด</p>
                    ) : (
                      inspectors.map((u) => {
                        const count = getOfficerWorkload(u.id);
                        const load = getLoadInfo(count);
                        const isSelected = selectedOfficer?.id === u.id;
                        const initialChar = u.fullName.trim().charAt(0) || 'จ';
                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedOfficer(u)}
                            className={`p-3 border rounded-[8px] cursor-pointer transition-all flex items-center gap-3 justify-between ${
                              isSelected 
                                ? 'border-emerald-600 bg-emerald-50/10 shadow-smooth-low' 
                                : 'border-gray-200 hover:bg-fuji-light/40 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Circle Initials */}
                              <div className="size-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[13px] shrink-0">
                                {initialChar}
                              </div>
                              {/* Middle contents */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-bold text-main truncate">
                                    {u.fullName}
                                  </span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${load.badgeBg} shrink-0`}>
                                    {count} งาน
                                  </span>
                                </div>
                                {/* Load progress bar */}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${load.barBg}`} 
                                      style={{ width: `${Math.min((count / 10) * 100, 100)}%` }} 
                                    />
                                  </div>
                                  <span className="text-[9px] text-placeholder font-medium shrink-0">
                                    {getOfficerZonesDisplay(u.userZones)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check className="size-3" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Step 3 Content */
              <div className="space-y-4 text-left">
                {/* Summary Box */}
                <div className="p-4 bg-white border border-gray-200 rounded-[10px] space-y-3.5 shadow-smooth-low">
                  <h4 className="text-[14px] font-bold text-main pb-2 border-b border-gray-100">
                    สรุปรายละเอียดงานตรวจสอบ
                  </h4>

                  {selectedLicense && (
                    <div className="grid grid-cols-[80px_1fr] text-[13px] leading-relaxed">
                      <span className="text-placeholder font-medium">ใบอนุญาต</span>
                      <span className="text-main font-bold">
                        <span className="text-emerald-700 font-mono">{selectedLicense.licenseNo}</span> — {selectedLicense.businessName}
                      </span>
                    </div>
                  )}

                  {selectedLicense && (
                    <div className="grid grid-cols-[80px_1fr] text-[13px] leading-relaxed">
                      <span className="text-placeholder font-medium">จังหวัด</span>
                      <span className="text-main font-bold">{selectedLicense.province}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-[80px_1fr] text-[13px] leading-relaxed">
                    <span className="text-placeholder font-medium">วันที่นัดตรวจ</span>
                    <span className="text-main font-bold">{dueDate}</span>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] text-[13px] leading-relaxed">
                    <span className="text-placeholder font-medium">ช่วงเวลา</span>
                    <span className="text-main font-bold">{timePeriod}</span>
                  </div>

                  {selectedOfficer && (
                    <div className="grid grid-cols-[80px_1fr] text-[13px] leading-relaxed">
                      <span className="text-placeholder font-medium">เจ้าหน้าที่</span>
                      <span className="text-main font-bold">{selectedOfficer.fullName}</span>
                    </div>
                  )}
                </div>

                {/* Conflict Check Alert */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] flex items-center gap-2">
                  <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="size-3" strokeWidth={3} />
                  </div>
                  <span className="text-[12px] text-emerald-800 font-bold">ไม่พบ Conflict — พร้อมมอบหมายงาน</span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <DialogFooter className="pt-3 gap-2 border-t border-gray-200 flex flex-row items-center justify-between sm:justify-between w-full">
              {/* Back button */}
              {success ? (
                <div />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step === 1) onOpenChange(false);
                    else setStep(step - 1);
                  }}
                  className="rounded-square border-gray-200 text-main hover:bg-fuji-light h-9 text-[13px] px-4 font-semibold"
                >
                  {step === 1 ? 'ยกเลิก' : '← ย้อนกลับ'}
                </Button>
              )}

              {/* Next/Submit button */}
              {success ? (
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-square bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low"
                >
                  เสร็จสิ้น
                </Button>
              ) : step < 3 ? (
                <Button
                  type="button"
                  disabled={
                    (step === 1 && !selectedLicense) || 
                    (step === 2 && (!dueDate || !selectedOfficer))
                  }
                  onClick={() => setStep(step + 1)}
                  className={`rounded-square text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low transition-all ${
                    (step === 1 && !selectedLicense) || (step === 2 && (!dueDate || !selectedOfficer))
                      ? 'bg-gray-200 cursor-not-allowed hover:bg-gray-200'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  ถัดไป ➔
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={handleWizardSubmit}
                  className="rounded-square bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-[13px] px-6 font-semibold shadow-smooth-low"
                >
                  {isPending ? 'กำลังบันทึก...' : 'ยืนยันมอบหมายงาน'}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
