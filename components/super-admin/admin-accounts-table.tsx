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
import { Search, Plus } from 'lucide-react';
import { AdminFormModal, AdminAccount } from './admin-form-modal';

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: '1',
    fullName: 'สมชาย วงศ์ทอง',
    email: 'somchai@diw.go.th',
    phone: '0812345678',
    czpUserId: 'CZP-00123',
    agencies: ['DIW'],
    status: 'Active',
    createdAt: '01/03/2568',
  },
  {
    id: '2',
    fullName: 'วิภา รัตนสุข',
    email: 'wipa@acfs.go.th',
    phone: '0898765432',
    czpUserId: 'CZP-00456',
    agencies: ['ACFS', 'DIW'],
    status: 'Active',
    createdAt: '15/03/2568',
  },
  {
    id: '3',
    fullName: 'ประสิทธิ์ ดีงาม',
    email: 'prasit@fda.moph.go.th',
    phone: '0855554444',
    czpUserId: 'CZP-00789',
    agencies: ['FDA'],
    status: 'Inactive',
    createdAt: '20/03/2568',
  },
  {
    id: '4',
    fullName: 'นภา สุขใจ',
    email: 'napa@dbd.go.th',
    phone: '0833332222',
    czpUserId: 'CZP-00321',
    agencies: ['DBD'],
    status: 'Active',
    createdAt: '01/04/2568',
  },
  {
    id: '5',
    fullName: 'อรุณ มาลัย',
    email: 'aroon@mol.go.th',
    phone: '0822221111',
    czpUserId: 'CZP-00654',
    agencies: ['MOL'],
    status: 'Active',
    createdAt: '10/04/2568',
  },
];

export function AdminAccountsTable() {
  const [admins, setAdmins] = React.useState<AdminAccount[]>(INITIAL_ADMINS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [agencyFilter, setAgencyFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAdmin, setEditingAdmin] = React.useState<AdminAccount | null>(null);

  // Generate Thai Buddhist Year Date String (e.g. 17/06/2569)
  const getThaiDateString = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const handleCreateNew = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleSave = (savedAdmin: AdminAccount) => {
    if (savedAdmin.id) {
      // Editing
      setAdmins((prev) =>
        prev.map((item) => (item.id === savedAdmin.id ? savedAdmin : item))
      );
    } else {
      // Creating
      const newAdmin: AdminAccount = {
        ...savedAdmin,
        id: String(Date.now()),
        createdAt: getThaiDateString(),
      };
      setAdmins((prev) => [...prev, newAdmin]);
    }
  };

  // Filter logic
  const filteredAdmins = admins.filter((admin) => {
    // Search filter
    const matchesSearch =
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.czpUserId.toLowerCase().includes(searchQuery.toLowerCase());

    // Agency filter
    const matchesAgency =
      agencyFilter === 'ALL' || admin.agencies.includes(agencyFilter);

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' || admin.status === statusFilter;

    return matchesSearch && matchesAgency && matchesStatus;
  });

  return (
    <div className="space-y-[16px]">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-border-default shadow-smooth-low">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-placeholder" />
            <Input
              placeholder="ค้นหาบัญชี Admin"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full border-border-neutral text-[13px] h-9"
            />
          </div>

          {/* Agency Filter */}
          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-border-neutral text-[13px] h-9">
              <SelectValue placeholder="หน่วยงานทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">หน่วยงานทั้งหมด</SelectItem>
              <SelectItem value="DIW">DIW (กรมโรงงานฯ)</SelectItem>
              <SelectItem value="ACFS">ACFS (มกอช.)</SelectItem>
              <SelectItem value="FDA">FDA (อย.)</SelectItem>
              <SelectItem value="DBD">DBD (กรมพัฒนาธุรกิจฯ)</SelectItem>
              <SelectItem value="MOL">MOL (กรมแรงงาน)</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-border-neutral text-[13px] h-9">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateNew}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white rounded-circle px-[18px] py-2 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9"
        >
          <Plus className="size-4" />
          สร้างบัญชี Admin ใหม่
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[12px] border border-border-default shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-fuji-light/30 border-b border-border-default">
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[220px]">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[240px]">
                  อีเมล
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[150px]">
                  czp_user_id
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[200px]">
                  หน่วยงานในสังกัด
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[120px]">
                  สถานะ
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder w-[130px]">
                  วันที่สร้าง
                </th>
                <th className="px-[16px] py-[10px] text-[12px] font-bold text-text-placeholder text-center w-[100px]">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[16px] py-[32px] text-center text-text-placeholder text-[13px]">
                    ไม่พบข้อมูลบัญชี Admin
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    {/* ชื่อ-นามสกุล */}
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-text-primary">
                      {row.fullName}
                    </td>

                    {/* อีเมล */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-placeholder font-medium font-mono">
                      {row.email}
                    </td>

                    {/* czp_user_id */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-primary font-bold font-mono">
                      {row.czpUserId}
                    </td>

                    {/* หน่วยงานในสังกัด */}
                    <td className="px-[16px] py-[12px]">
                      <div className="flex flex-wrap gap-[4px] items-center">
                        {row.agencies.map((agency) => (
                          <span
                            key={agency}
                            className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] text-[11px] px-2 py-0.5 font-bold font-mono leading-tight"
                          >
                            {agency}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* สถานะ */}
                    <td className="px-[16px] py-[12px]">
                      <span
                        className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold leading-tight ${
                          row.status === 'Active'
                            ? 'bg-[#d0fae5] text-[#007a55]'
                            : 'bg-fuji-light text-text-placeholder'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* วันที่สร้าง */}
                    <td className="px-[16px] py-[12px] text-[13px] text-text-placeholder font-medium">
                      {row.createdAt}
                    </td>

                    {/* จัดการ */}
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

      {/* Info Tip Box matching the bottom box in screenshot */}
      <div className="bg-[#e6f4ff]/40 border border-[#91caff]/40 rounded-[12px] p-[16px] text-left">
        <h4 className="text-[13px] font-bold text-[#0958d9] mb-1.5">
          ข้อมูลคำแนะนำสำหรับการใช้งาน (Modal เพิ่ม/แก้ไขบัญชี Admin)
        </h4>
        <ul className="list-disc pl-5 text-[12px] text-[#4a5565] space-y-1">
          <li><strong>ยืนยันตัวตน:</strong> ข้อมูล ชื่อ-นามสกุล, อีเมล, และเบอร์โทร จะได้รับการยืนยันและดึง czp_user_id จากระบบ mToken</li>
          <li><strong>หน่วยงานในสังกัด:</strong> สนับสนุนการเลือกแบบ multi-select (สามารถมอบหมายให้ดูแลได้มากกว่า 1 หน่วยงาน เช่น DIW และ มกอช. พร้อมกัน)</li>
          <li><strong>สถานะการใช้งาน:</strong> บัญชีจะสามารถสลับสถานะการเข้าใช้งานได้ระหว่าง Active และ Inactive</li>
        </ul>
      </div>

      {/* Admin Form Modal */}
      <AdminFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        admin={editingAdmin}
        onSave={handleSave}
      />
    </div>
  );
}
