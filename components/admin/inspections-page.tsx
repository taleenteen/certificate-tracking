'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Activity, 
  CheckCircle2, 
  Users, 
  Search, 
  Plus, 
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { MOCK_INSPECTIONS, type InspectionTask } from '@/constants/mock-inspections';
import { InspectionFormModal } from './inspection-form-modal';

export function InspectionsPage() {
  const [inspections, setInspections] = React.useState<InspectionTask[]>(MOCK_INSPECTIONS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<InspectionTask | null>(null);

  // Compute stats dynamically from the state
  const waitingCount = inspections.filter((i) => i.status === 'WAITING_ASSIGNMENT').length;
  const inProgressCount = inspections.filter((i) => i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter((i) => i.status === 'COMPLETED').length;
  
  // Total inspectors count
  const officersCount = 4;

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: InspectionTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (savedTask: InspectionTask) => {
    setInspections((prev) => {
      const exists = prev.some((i) => i.id === savedTask.id);
      if (exists) {
        return prev.map((i) => (i.id === savedTask.id ? savedTask : i));
      } else {
        return [savedTask, ...prev];
      }
    });
  };

  // Filter tasks based on filters and search queries
  const filteredTasks = React.useMemo(() => {
    return inspections.filter((task) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.licenseNo.toLowerCase().includes(query) ||
        task.operatorName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || task.status === statusFilter;

      const matchesType =
        typeFilter === 'ALL' || task.licenseType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [inspections, searchQuery, statusFilter, typeFilter]);

  const getStatusBadge = (status: InspectionTask['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            มอบหมายแล้ว
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            กำลังดำเนินการ
          </span>
        );
      case 'WAITING_ASSIGNMENT':
        return (
          <span className="inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
            รอมอบหมาย
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            เสร็จสิ้น
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ยกเลิก
          </span>
        );
    }
  };

  return (
    <div className="space-y-[16px] text-left">
      {/* ─── SUMMARY STATS (4 CARDS) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 1: Waiting for Inspection */}
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-amber-500 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-1">
            <ClipboardList className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">งานที่รอการตรวจสอบ</h3>
            <p className="text-[11px] text-[#ad8306] font-medium leading-none">ยังไม่ได้มอบหมายเจ้าหน้าที่</p>
            <p className="text-3xl font-bold text-main pt-1">{waitingCount}</p>
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-150">
            <TrendingUp className="size-3" />
            <span>3 ใหม่</span>
          </div>
        </Card>

        {/* Card 2: In Progress */}
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-blue-500 bg-blue-50 p-2.5 rounded-xl border border-blue-100 mt-1">
            <Activity className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">งานที่กำลังดำเนินการ</h3>
            <p className="text-[11px] text-blue-600 font-medium leading-none">เจ้าหน้าที่กำลังตรวจสอบ</p>
            <p className="text-3xl font-bold text-main pt-1">{inProgressCount}</p>
          </div>
        </Card>

        {/* Card 3: Completed this Month */}
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-emerald-500 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-1">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">งานเสร็จสิ้นเดือนนี้</h3>
            <p className="text-[11px] text-emerald-600 font-medium leading-none">มิถุนายน 2568</p>
            <p className="text-3xl font-bold text-main pt-1">{completedCount}</p>
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-green-150">
            <TrendingUp className="size-3" />
            <span>15.2%</span>
          </div>
        </Card>

        {/* Card 4: All Officers */}
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-purple-500 bg-purple-50 p-2.5 rounded-xl border border-purple-100 mt-1">
            <Users className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">เจ้าหน้าที่ในสังกัดทั้งหมด</h3>
            <p className="text-[11px] text-purple-600 font-medium leading-none">สังกัดหน่วยงาน DIW</p>
            <p className="text-3xl font-bold text-main pt-1">{officersCount}</p>
          </div>
        </Card>
      </div>

      {/* ─── FILTERS ROW ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-gray-200 shadow-smooth-low">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-placeholder" />
            <Input
              placeholder="ค้นหา ชื่องาน / ผู้ประกอบการ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full border-gray-200 text-[13px] h-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] border-gray-200 text-[13px] h-9 bg-white">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
              <SelectItem value="WAITING_ASSIGNMENT">รอการมอบหมาย</SelectItem>
              <SelectItem value="ASSIGNED">มอบหมายแล้ว</SelectItem>
              <SelectItem value="IN_PROGRESS">กำลังดำเนินการ</SelectItem>
              <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>

          {/* License Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px] border-gray-200 text-[13px] h-9 bg-white">
              <SelectValue placeholder="ประเภททั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ประเภททั้งหมด</SelectItem>
              <SelectItem value="รง.4">รง.4</SelectItem>
              <SelectItem value="วัตถุอันตราย">วัตถุอันตราย</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Picker Placeholder */}
          <div className="w-full sm:w-[180px] border border-gray-200 text-[13px] h-9 rounded-md flex items-center justify-between px-3 bg-white text-[#707993]">
            <span>ตัวกรอง: ช่วงวันที่</span>
            <Calendar className="size-4" />
          </div>
        </div>

        {/* Create Task Button */}
        <Button
          onClick={handleCreateTask}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white h-9 px-4 text-[13px] font-semibold gap-1.5 shadow-smooth-low rounded-square shrink-0"
        >
          <Plus className="size-4" />
          สร้างงานตรวจสอบใหม่
        </Button>
      </div>

      {/* ─── DATA TABLE ─── */}
      <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-fuji-light/30 border-b border-gray-200">
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[110px]">เลขที่งาน</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[150px]">เลขที่ใบอนุญาต</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[130px]">ประเภทใบอนุญาต</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder">ชื่อผู้ประกอบการ</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[180px]">เจ้าหน้าที่ที่รับผิดชอบ</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[110px]">วันที่นัดตรวจ</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[130px]">สถานะ</th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[130px]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-[16px] py-24 text-center text-placeholder text-[13px]">
                    ไม่พบข้อมูลงานตรวจสอบ
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="border-b border-fuji-light/50 hover:bg-fuji-light/5 transition-colors"
                  >
                    {/* Task Id Link */}
                    <td className="px-[16px] py-[12px] text-[13px] text-brand-primary font-bold">
                      <span 
                        className="cursor-pointer hover:underline"
                        onClick={() => handleEditTask(task)}
                      >
                        {task.id}
                      </span>
                    </td>
                    {/* License No */}
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{task.licenseNo}</td>
                    {/* License Type Badge */}
                    <td className="px-[16px] py-[12px]">
                      <span className="bg-fuji-light/50 text-sub border border-fuji-soft rounded-[4px] px-2 py-0.5 text-[11px] font-bold">
                        {task.licenseType}
                      </span>
                    </td>
                    {/* Operator Name */}
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{task.operatorName}</td>
                    {/* Assignee */}
                    <td className="px-[16px] py-[12px] text-[13px]">
                      {task.assignee ? (
                        <span className="text-main font-medium">{task.assignee.name}</span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertCircle className="size-3.5 shrink-0" />
                          ยังไม่ได้มอบหมาย
                        </span>
                      )}
                    </td>
                    {/* Inspection Date */}
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{task.inspectionDate}</td>
                    {/* Status Badge */}
                    <td className="px-[16px] py-[12px]">
                      {getStatusBadge(task.status)}
                    </td>
                    {/* Actions */}
                    <td className="px-[16px] py-[12px] text-[13px] font-semibold space-x-2.5">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        แก้ไข
                      </button>
                      {task.status === 'WAITING_ASSIGNMENT' && (
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-[#1e7d55] hover:text-[#165a3d] cursor-pointer"
                        >
                          มอบหมาย
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── FORM MODAL ─── */}
      <InspectionFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
