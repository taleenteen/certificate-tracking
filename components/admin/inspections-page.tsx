"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Activity,
  CheckCircle2,
  Users,
  Search,
  Plus,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  useInspectionTasks,
  taskStatusLabel,
  type InspectionTaskSummary,
  type AdminTaskStatus,
} from "@/hooks/useInspectionTasks";
import { useUsers } from "@/hooks/useUsers";
import { InspectionFormModal } from "./inspection-form-modal";

const STATUS_BADGE: Record<
  AdminTaskStatus,
  { bg: string; text: string; border: string }
> = {
  WAITING_ASSIGNMENT: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  ASSIGNED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  IN_PROGRESS: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  PENDING_REVIEW: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  RETURNED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  CANCELLED: {
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};

function StatusBadge({ status }: { status: AdminTaskStatus }) {
  const c = STATUS_BADGE[status] ?? STATUS_BADGE.CANCELLED;
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      {taskStatusLabel(status)}
    </span>
  );
}

const formatDueDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "short",
  });
};

export function InspectionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useInspectionTasks(statusFilter !== "ALL" ? statusFilter : undefined);
  const { data: inspectors = [] } = useUsers({ role: "officer" });

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [assigningTask, setAssigningTask] =
    React.useState<InspectionTaskSummary | null>(null);

  const waitingCount = tasks.filter(
    (t) => t.status === "WAITING_ASSIGNMENT",
  ).length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const completedCount = tasks.filter((t) => t.status === "APPROVED").length;

  const filteredTasks = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.taskNo.toLowerCase().includes(q) ||
        t.business.nameTh.toLowerCase().includes(q) ||
        (t.license?.licenseNumber ?? "").toLowerCase().includes(q),
    );
  }, [tasks, searchQuery]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <p className="text-[13px] text-placeholder">โหลดข้อมูลไม่สำเร็จ</p>
        <button
          onClick={() => refetch()}
          className="text-[13px] font-semibold text-brand-primary hover:underline"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-[16px] text-left">
      {/* ─── SUMMARY STATS (4 CARDS) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-amber-500 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-1">
            <ClipboardList className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">
              งานที่รอการตรวจสอบ
            </h3>
            <p className="text-[11px] text-[#ad8306] font-medium leading-none">
              ยังไม่ได้มอบหมายเจ้าหน้าที่
            </p>
            <p className="text-3xl font-bold text-main pt-1">
              {isLoading ? (
                <RefreshCw className="animate-spin size-5 inline-block" />
              ) : (
                waitingCount
              )}
            </p>
          </div>
          {waitingCount > 0 && (
            <div className="absolute right-4 top-4 flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
              <TrendingUp className="size-3" />
              <span>รอดำเนินการ</span>
            </div>
          )}
        </Card>

        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-blue-500 bg-blue-50 p-2.5 rounded-xl border border-blue-100 mt-1">
            <Activity className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">
              งานที่กำลังดำเนินการ
            </h3>
            <p className="text-[11px] text-blue-600 font-medium leading-none">
              เจ้าหน้าที่กำลังตรวจสอบ
            </p>
            <p className="text-3xl font-bold text-main pt-1">
              {isLoading ? (
                <RefreshCw className="animate-spin size-5 inline-block" />
              ) : (
                inProgressCount
              )}
            </p>
          </div>
        </Card>

        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-emerald-500 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-1">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">
              งานเสร็จสิ้น
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium leading-none">
              สถานะ: อนุมัติแล้ว
            </p>
            <p className="text-3xl font-bold text-main pt-1">
              {isLoading ? (
                <RefreshCw className="animate-spin size-5 inline-block" />
              ) : (
                completedCount
              )}
            </p>
          </div>
        </Card>

        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-4 items-start relative overflow-hidden">
          <div className="text-purple-500 bg-purple-50 p-2.5 rounded-xl border border-purple-100 mt-1">
            <Users className="size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-[13px] font-semibold text-placeholder">
              เจ้าหน้าที่ในสังกัด
            </h3>
            <p className="text-[11px] text-purple-600 font-medium leading-none">
              ผู้ตรวจสอบทั้งหมด
            </p>
            <p className="text-3xl font-bold text-main pt-1">
              {inspectors.length}
            </p>
          </div>
        </Card>
      </div>

      {/* ─── FILTERS ROW ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-gray-200 shadow-smooth-low">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-placeholder" />
            <Input
              placeholder="ค้นหา เลขงาน / กิจการ / ใบอนุญาต"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full border-gray-200 text-[13px] h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-200 text-[13px] h-9 bg-white">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
              <SelectItem value="WAITING_ASSIGNMENT">รอการมอบหมาย</SelectItem>
              <SelectItem value="ASSIGNED">มอบหมายแล้ว</SelectItem>
              <SelectItem value="IN_PROGRESS">กำลังดำเนินการ</SelectItem>
              <SelectItem value="APPROVED">เสร็จสิ้น</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
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
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[110px]">
                  เลขที่งาน
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[150px]">
                  เลขที่ใบอนุญาต
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[130px]">
                  ประเภท
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder">
                  ชื่อกิจการ
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[180px]">
                  เจ้าหน้าที่รับผิดชอบ
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[110px]">
                  วันนัดตรวจ
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[130px]">
                  สถานะ
                </th>
                <th className="px-[16px] py-[12px] text-[12px] font-bold text-placeholder w-[120px]">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-[16px] py-24 text-center text-placeholder text-[13px]"
                  >
                    <RefreshCw className="animate-spin size-4 inline-block mr-2" />
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-[16px] py-24 text-center text-placeholder text-[13px]"
                  >
                    ไม่พบข้อมูลงานตรวจสอบ
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-fuji-light/50 hover:bg-fuji-light/5 transition-colors"
                  >
                    <td className="px-[16px] py-[12px] text-[13px] text-brand-primary font-bold font-mono">
                      {task.taskNo}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium font-mono">
                      {task.license?.licenseNumber ?? "—"}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      {task.license ? (
                        <span className="bg-fuji-light/50 text-sub border border-fuji-soft rounded-[4px] px-2 py-0.5 text-[11px] font-bold">
                          {task.license.licenseType.code}
                        </span>
                      ) : (
                        <span className="text-placeholder text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {task.business.nameTh}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px]">
                      {task.assignee ? (
                        <span className="text-main font-medium">
                          {task.assignee.fullName}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertCircle className="size-3.5 shrink-0" />
                          ยังไม่ได้มอบหมาย
                        </span>
                      )}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {formatDueDate(task.dueDate)}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] font-semibold space-x-2.5">
                      <button
                        onClick={() => setAssigningTask(task)}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer text-md"
                      >
                        แก้ไข
                      </button>
                      {task.status === "WAITING_ASSIGNMENT" && (
                        <button
                          onClick={() => setAssigningTask(task)}
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

      {/* ─── CREATE MODAL ─── */}
      <InspectionFormModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* ─── ASSIGN MODAL ─── */}
      {assigningTask && (
        <InspectionFormModal
          open={!!assigningTask}
          onOpenChange={(v) => {
            if (!v) setAssigningTask(null);
          }}
          mode="assign"
          task={assigningTask}
        />
      )}
    </div>
  );
}
