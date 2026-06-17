'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MasterDataModal, MasterDataCategory } from './master-data-modal';

// MOCK DATA

const INITIAL_AGENCIES = [
  { id: '1', agencyCode: 'DIW', name: 'กรมโรงงานอุตสาหกรรม', licenseTypes: ['ร.ง.4', 'วัตถุอันตราย'], adminCount: 3 },
  { id: '2', agencyCode: 'ACFS', name: 'มกอช.', licenseTypes: ['ใบอนุญาตผลิต', 'ใบอนุญาตนำเข้า', 'GAP/HACCP'], adminCount: 5 },
  { id: '3', agencyCode: 'FDA', name: 'สำนักงานคณะกรรมการอาหารและยา', licenseTypes: ['ใบอนุญาตผลิต', 'ใบสำคัญอาหาร'], adminCount: 4 },
  { id: '4', agencyCode: 'DBD', name: 'กรมพัฒนาธุรกิจการค้า', licenseTypes: ['ใบทะเบียนพาณิชย์'], adminCount: 2 },
];

const INITIAL_LICENSE_TYPES = [
  { id: '1', name: 'ร.ง.4', code: 'RNG4', duration: '5 ปี', agency: 'DIW', law: 'พรบ.โรงงาน 2535' },
  { id: '2', name: 'วัตถุอันตราย', code: 'HAZ', duration: '3 ปี', agency: 'DIW', law: 'พรบ.วัตถุอันตราย 2535' },
  { id: '3', name: 'ใบอนุญาตผลิต', code: 'MFG', duration: '3 ปี', agency: 'ACFS', law: 'พรบ.มาตรฐานสินค้า 2503' },
  { id: '4', name: 'GAP/HACCP', code: 'GAP', duration: '2 ปี', agency: 'ACFS', law: 'มกษ. 9001-2556' },
];

const INITIAL_LOCATIONS = [
  { id: '1', code: '10', province: 'กรุงเทพมหานคร', zone: 'กทม.', region: 'กลาง' },
  { id: '2', code: '11', province: 'สมุทรปราการ', zone: 'ปริมณฑล', region: 'กลาง' },
  { id: '3', code: '50', province: 'เชียงใหม่', zone: 'ภาคเหนือตอนบน', region: 'เหนือ' },
  { id: '4', code: '30', province: 'นครราชสีมา', zone: 'ภาคตะวันออกเฉียงเหนือ', region: 'อีสาน' },
];

const INITIAL_STATUSES = [
  { id: '1', statusCode: 'PENDING', statusName: 'รออนุมัติ', description: 'ใบอนุญาตยื่นแล้ว รอเจ้าหน้าที่ตรวจสอบ', nextAction: 'ตรวจสอบเอกสาร', color: 'warning' },
  { id: '2', statusCode: 'APPROVED', statusName: 'อนุมัติ', description: 'ใบอนุญาตผ่านการพิจารณา', nextAction: 'ออกใบอนุญาต', color: 'success' },
  { id: '3', statusCode: 'REJECTED', statusName: 'ปฏิเสธ', description: 'ไม่ผ่านเงื่อนไขการพิจารณา', nextAction: 'แจ้งเหตุผล / ยื่นใหม่', color: 'critical' },
  { id: '4', statusCode: 'SUSPENDED', statusName: 'ระงับ', description: 'ระงับใบอนุญาตชั่วคราว', nextAction: 'รอการชำระค่าธรรมเนียม', color: 'purple' },
  { id: '5', statusCode: 'EXPIRED', statusName: 'หมดอายุ', description: 'ใบอนุญาตพ้นกำหนดระยะเวลา', nextAction: 'ยื่นต่ออายุ', color: 'muted' },
];

const TABS = [
  { id: 'agencies', label: 'หน่วยงาน' },
  { id: 'licenseTypes', label: 'ประเภทใบอนุญาต' },
  { id: 'locations', label: 'จังหวัด/เขตพื้นที่' },
  { id: 'statuses', label: 'สถานะ & Next Action' },
] as const;

export function MasterDataTable() {
  const [activeTab, setActiveTab] = React.useState<MasterDataCategory>('agencies');

  // Lists of data
  const [agencies, setAgencies] = React.useState(INITIAL_AGENCIES);
  const [licenseTypes, setLicenseTypes] = React.useState(INITIAL_LICENSE_TYPES);
  const [locations, setLocations] = React.useState(INITIAL_LOCATIONS);
  const [statuses, setStatuses] = React.useState(INITIAL_STATUSES);

  // Modal control
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (savedItem: any) => {
    if (activeTab === 'agencies') {
      if (savedItem.id) {
        setAgencies((prev) => prev.map((x) => (x.id === savedItem.id ? savedItem : x)));
      } else {
        const newItem = { ...savedItem, id: String(Date.now()) };
        setAgencies((prev) => [...prev, newItem]);
      }
    } else if (activeTab === 'licenseTypes') {
      if (savedItem.id) {
        setLicenseTypes((prev) => prev.map((x) => (x.id === savedItem.id ? savedItem : x)));
      } else {
        const newItem = { ...savedItem, id: String(Date.now()) };
        setLicenseTypes((prev) => [...prev, newItem]);
      }
    } else if (activeTab === 'locations') {
      if (savedItem.id) {
        setLocations((prev) => prev.map((x) => (x.id === savedItem.id ? savedItem : x)));
      } else {
        const newItem = { ...savedItem, id: String(Date.now()) };
        setLocations((prev) => [...prev, newItem]);
      }
    } else if (activeTab === 'statuses') {
      if (savedItem.id) {
        setStatuses((prev) => prev.map((x) => (x.id === savedItem.id ? savedItem : x)));
      } else {
        const newItem = { ...savedItem, id: String(Date.now()) };
        setStatuses((prev) => [...prev, newItem]);
      }
    }
  };

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'agencies':
        return 'เพิ่มหน่วยงาน';
      case 'licenseTypes':
        return 'เพิ่มประเภทใบอนุญาต';
      case 'locations':
        return 'เพิ่มจังหวัด/เขตพื้นที่';
      case 'statuses':
        return 'เพิ่มสถานะ';
      default:
        return 'เพิ่มข้อมูล';
    }
  };

  // Helper arrays for Select items in modal
  const existingAgencyCodes = agencies.map((x) => x.agencyCode);
  const existingLicenseNames = licenseTypes.map((x) => x.name);

  return (
    <div className="space-y-[16px]">
      {/* Tabs navigation row */}
      <div className="flex border-b border-gray-200 gap-8 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[14px] font-medium transition-all relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-brand-primary font-bold'
                : 'text-placeholder hover:text-main'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-full animate-in fade-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Actions Row */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleAddClick}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white rounded-square px-[14px] py-1.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9 cursor-pointer"
        >
          <Plus className="size-4" />
          {getAddButtonLabel()}
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          {activeTab === 'agencies' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-fuji-light/30 border-b border-gray-200">
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[220px]">
                    agency_code
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[320px]">
                    ชื่อหน่วยงาน
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[320px]">
                    ประเภทใบอนุญาตที่รับผิดชอบ
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[160px]">
                    จำนวน Admin ที่ดูแล
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-brand-primary font-mono">
                      {row.agencyCode}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {row.name}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex flex-wrap gap-[4px] items-center">
                        {row.licenseTypes.map((t) => (
                          <span
                            key={t}
                            className="bg-fuji-light/50 text-[#4a5565] border border-gray-200/20 rounded-[4px] px-2 py-0.5 text-[11px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px] text-center text-[13px] text-main font-medium">
                      {row.adminCount}
                    </td>
                    <td className="px-[16px] py-[12px] text-center">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'licenseTypes' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-fuji-light/30 border-b border-gray-200">
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[260px]">
                    ชื่อประเภทใบอนุญาต
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">
                    รหัส
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">
                    อายุใบอนุญาต
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[200px]">
                    หน่วยงานที่รับผิดชอบ
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[260px]">
                    กฎหมายอ้างอิง
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {licenseTypes.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-main">
                      {row.name}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium font-mono">
                      {row.code}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {row.duration}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                        {row.agency}
                      </span>
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium">
                      {row.law}
                    </td>
                    <td className="px-[16px] py-[12px] text-center">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'locations' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-fuji-light/30 border-b border-gray-200">
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">
                    รหัส
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[320px]">
                    จังหวัด
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[320px]">
                    เขตพื้นที่
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">
                    ภาค
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {locations.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-main font-mono">
                      {row.code}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {row.province}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-sky-dark font-mono font-medium">
                      {row.zone}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <span className="bg-fuji-light text-placeholder px-2 py-0.5 rounded-[4px] text-[11px] font-bold leading-tight">
                        {row.region}
                      </span>
                    </td>
                    <td className="px-[16px] py-[12px] text-center">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'statuses' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-fuji-light/30 border-b border-gray-200">
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[180px]">
                    รหัสสถานะ
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[180px]">
                    ชื่อสถานะ
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[360px]">
                    คำอธิบาย
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[220px]">
                    Next Action
                  </th>
                  <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                    <td className="px-[16px] py-[12px] text-[13px] font-bold text-main font-mono">
                      {row.statusCode}
                    </td>
                    <td className="px-[16px] py-[12px]">
                      <span
                        className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold leading-tight ${
                          row.color === 'success'
                            ? 'bg-[#d0fae5] text-[#007a55]'
                            : row.color === 'warning'
                            ? 'bg-[#fffbe6] text-[#d48806] border border-[#ffe58f]'
                            : row.color === 'critical'
                            ? 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]'
                            : row.color === 'purple'
                            ? 'bg-[#f5e6ff] text-[#722ed1] border border-[#d3adf7]'
                            : 'bg-fuji-light text-placeholder'
                        }`}
                      >
                        {row.statusName}
                      </span>
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium">
                      {row.description}
                    </td>
                    <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">
                      {row.nextAction}
                    </td>
                    <td className="px-[16px] py-[12px] text-center">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all"
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Conditionally render bottom demo card for License Types when active tab is Agencies (Screenshot 1 parity) */}
      {activeTab === 'agencies' && (
        <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white p-[16px] space-y-3">
          <h3 className="text-[13px] font-bold text-main text-left">
            ตัวอย่างแท็บ "ประเภทใบอนุญาต"
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-fuji-light/20 border-b border-gray-200">
                  <th className="px-[12px] py-[8px] text-[12px] font-bold text-placeholder w-[240px]">ชื่อประเภทใบอนุญาต</th>
                  <th className="px-[12px] py-[8px] text-[12px] font-bold text-placeholder w-[120px]">รหัส</th>
                  <th className="px-[12px] py-[8px] text-[12px] font-bold text-placeholder w-[120px]">อายุใบอนุญาต</th>
                  <th className="px-[12px] py-[8px] text-[12px] font-bold text-placeholder w-[180px]">หน่วยงานที่รับผิดชอบ</th>
                  <th className="px-[12px] py-[8px] text-[12px] font-bold text-placeholder w-[240px]">กฎหมายอ้างอิง</th>
                </tr>
              </thead>
              <tbody>
                {licenseTypes.map((row) => (
                  <tr key={row.id} className="border-b border-fuji-light/50">
                    <td className="px-[12px] py-[10px] text-[12px] font-bold text-main">{row.name}</td>
                    <td className="px-[12px] py-[10px] text-[12px] text-placeholder font-mono">{row.code}</td>
                    <td className="px-[12px] py-[10px] text-[12px] text-main">{row.duration}</td>
                    <td className="px-[12px] py-[10px]">
                      <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                        {row.agency}
                      </span>
                    </td>
                    <td className="px-[12px] py-[10px] text-[12px] text-placeholder">{row.law}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-placeholder text-left">
            - ร.ง.4: ไม่มีวันหมดอายุ (Suspended จากค่าธรรมเนียมรายปี) | วัตถุอันตราย: 3 ปี | ACFS คือ 3 ประเภท: ตามเกณฑ์ มกอช.
          </p>
        </Card>
      )}

      {/* Master Data Dialog Modal */}
      <MasterDataModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={activeTab}
        item={editingItem}
        onSave={handleSave}
        existingAgencies={existingAgencyCodes}
        existingLicenseTypes={existingLicenseNames}
      />
    </div>
  );
}
