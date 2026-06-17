'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useUsers, useCreateUser, useSuspendUser, type SystemUserSummary } from '@/hooks/useUsers';
import { useAgencies } from '@/hooks/useAgencies';
import { toast } from 'sonner';
import { AdminFormModal, type AdminFormData } from './admin-form-modal';

export function AdminAccountsTable() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [agencyFilter, setAgencyFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const { data: users = [], isLoading, isError, refetch } = useUsers({
    q: searchQuery || undefined,
    role: 'admin',
  });
  const { data: agencies = [] } = useAgencies();

  const createUser = useCreateUser();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<SystemUserSummary | null>(null);

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: SystemUserSummary) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (data: AdminFormData) => {
    if (editingUser) {
      // Edit is not implemented in v1 (would need PATCH /users/:id)
      toast.info('การแก้ไขบัญชีทำผ่าน PATCH /users/:id/roles และ /agency แยกกัน');
      return;
    }
    createUser.mutate(
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        roles: ['admin'],
        agencyId: data.agencyId,
        zoneIds: [],
      },
      {
        onSuccess: () => {
          toast.success('สร้างบัญชี Admin สำเร็จ');
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.message ?? 'ไม่สามารถสร้างบัญชีได้');
        },
      },
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesAgency = agencyFilter === 'ALL' || u.agencyId === agencyFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Active' ? u.isActive : !u.isActive);
    return matchesAgency && matchesStatus;
  });

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
        <p className="text-[13px] text-placeholder">โหลดข้อมูลไม่สำเร็จ</p>
        <button onClick={() => refetch()} className="text-[13px] font-semibold text-brand-primary hover:underline">
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-[16px]">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-gray-200 shadow-smooth-low">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-placeholder" />
            <Input
              placeholder="ค้นหาบัญชี Admin"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full border-gray-200 text-[13px] h-9"
            />
          </div>

          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-200 text-[13px] h-9">
              <SelectValue placeholder="หน่วยงานทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">หน่วยงานทั้งหมด</SelectItem>
              {agencies.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.code} — {a.nameTh}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-200 text-[13px] h-9">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCreateNew}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white rounded-circle px-[18px] py-2 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9"
        >
          <Plus className="size-4" />
          สร้างบัญชี Admin ใหม่
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-fuji-light/30 border-b border-gray-200">
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[220px]">ชื่อ-นามสกุล</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[240px]">อีเมล / ชื่อผู้ใช้</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[130px]">เลขบัตร (ท้าย 4 หลัก)</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">หน่วยงาน</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">สถานะ</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[130px]">เข้าสู่ระบบล่าสุด</th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">
                    <RefreshCw className="animate-spin size-4 inline-block mr-2" />
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">
                    ไม่พบข้อมูลบัญชี Admin
                  </td>
                </tr>
              ) : (
                filteredUsers.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-main">{row.fullName}</td>
                    <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium font-mono">
                      {row.email ?? row.username ?? '—'}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-bold font-mono">
                      {row.citizenIdLast4 ? `…${row.citizenIdLast4}` : '—'}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      {row.agencyId ? (() => {
                        const ag = agencies.find((a) => a.id === row.agencyId);
                        return (
                          <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] text-[11px] px-2 py-0.5 font-bold font-mono leading-tight">
                            {ag?.code ?? row.agencyId.slice(0, 8)}
                          </span>
                        );
                      })() : '—'}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold leading-tight ${
                        row.isActive ? 'bg-[#d0fae5] text-[#007a55]' : 'bg-fuji-light text-placeholder'
                      }`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium">
                      {formatDate(row.lastLoginAt)}
                    </td>
                    <td className="px-[16px] py-[12px] text-center">
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-[#e6f4ff]/40 border border-[#91caff]/40 rounded-[12px] p-[16px] text-left">
        <h4 className="text-[13px] font-bold text-[#0958d9] mb-1.5">
          ข้อมูลบัญชี Admin (ข้อมูลจริงจากระบบ)
        </h4>
        <ul className="list-disc pl-5 text-[12px] text-[#4a5565] space-y-1">
          <li><strong>สิทธิ์ Super Admin:</strong> สามารถสร้าง/แก้ไขบัญชี Admin ของทุกหน่วยงานได้</li>
          <li><strong>หน่วยงาน:</strong> หน่วยงานที่รองรับบริหารจัดการได้ที่ Master Data → Agencies (1 บัญชีต่อ 1 หน่วยงาน)</li>
          <li><strong>สถานะ:</strong> สามารถระงับบัญชีผ่าน PATCH /users/:id/suspend</li>
        </ul>
      </div>

      <AdminFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={editingUser}
        onSave={handleSave}
        isSaving={createUser.isPending}
      />
    </div>
  );
}
