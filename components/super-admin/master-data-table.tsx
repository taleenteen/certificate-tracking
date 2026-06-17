'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { MasterDataModal, MasterDataCategory } from './master-data-modal';
import { useZones, useCreateZone, useUpdateZone, type Zone } from '@/hooks/useZones';
import { useLicenseTypes, useCreateLicenseType, useUpdateLicenseType, type LicenseTypeRecord } from '@/hooks/useLicenseTypes';
import { useAgencies, useCreateAgency, useUpdateAgency, type AgencyRecord } from '@/hooks/useAgencies';
import { toast } from 'sonner';

const STATUSES_STATIC = [
  { statusCode: 'ACTIVE', statusName: 'มีผล', description: 'ใบอนุญาตใช้งานได้', nextAction: 'ต่ออายุก่อนหมดอายุ', color: 'success' },
  { statusCode: 'PENDING', statusName: 'รออนุมัติ', description: 'ยื่นแล้ว รอตรวจสอบ', nextAction: 'ตรวจสอบเอกสาร', color: 'warning' },
  { statusCode: 'SUSPENDED', statusName: 'ระงับ', description: 'ระงับใบอนุญาตชั่วคราว', nextAction: 'รอชำระค่าธรรมเนียม', color: 'purple' },
  { statusCode: 'EXPIRED', statusName: 'หมดอายุ', description: 'ใบอนุญาตพ้นกำหนด', nextAction: 'ยื่นต่ออายุ', color: 'muted' },
  { statusCode: 'REVOKED', statusName: 'ถูกเพิกถอน', description: 'ใบอนุญาตถูกยกเลิกถาวร', nextAction: 'ยื่นขอใหม่', color: 'critical' },
];

const TABS = [
  { id: 'agencies', label: 'หน่วยงาน', readOnly: false },
  { id: 'licenseTypes', label: 'ประเภทใบอนุญาต', readOnly: false },
  { id: 'locations', label: 'จังหวัด/เขตพื้นที่', readOnly: false },
  { id: 'statuses', label: 'สถานะ & Next Action', readOnly: true },
] as const;

type TabId = typeof TABS[number]['id'];

function statusColorClass(color: string) {
  switch (color) {
    case 'success': return 'bg-[#d0fae5] text-[#007a55]';
    case 'warning': return 'bg-[#fffbe6] text-[#d48806] border border-[#ffe58f]';
    case 'critical': return 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]';
    case 'purple': return 'bg-[#f5e6ff] text-[#722ed1] border border-[#d3adf7]';
    default: return 'bg-fuji-light text-placeholder';
  }
}

export function MasterDataTable() {
  const [activeTab, setActiveTab] = React.useState<TabId>('agencies');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const { data: zones = [], isLoading: zonesLoading, isError: zonesError, refetch: refetchZones } = useZones();
  const { data: licenseTypes = [], isLoading: ltLoading, isError: ltError, refetch: refetchLt } = useLicenseTypes();
  const { data: agencies = [], isLoading: agenciesLoading, isError: agenciesError, refetch: refetchAgencies } = useAgencies();

  const createZone = useCreateZone();
  const updateZone = useUpdateZone(editingItem?.id ?? '');
  const createLt = useCreateLicenseType();
  const updateLt = useUpdateLicenseType(editingItem?.id ?? '');
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency(editingItem?.id ?? '');

  const currentTab = TABS.find((t) => t.id === activeTab);
  const isReadOnly = currentTab?.readOnly ?? false;

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
        updateAgency.mutate(
          { nameTh: savedItem.nameTh, nameEn: savedItem.nameEn, dataSource: savedItem.dataSource, apiStatus: savedItem.apiStatus, isActive: savedItem.isActive },
          {
            onSuccess: () => { toast.success('แก้ไขหน่วยงานสำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      } else {
        createAgency.mutate(
          { code: savedItem.code, nameTh: savedItem.nameTh, nameEn: savedItem.nameEn, dataSource: savedItem.dataSource, apiStatus: savedItem.apiStatus },
          {
            onSuccess: () => { toast.success('เพิ่มหน่วยงานสำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      }
    } else if (activeTab === 'locations') {
      if (savedItem.id) {
        updateZone.mutate(
          { nameTh: savedItem.nameTh ?? savedItem.zone, province: savedItem.province },
          {
            onSuccess: () => { toast.success('แก้ไขเขตพื้นที่สำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      } else {
        createZone.mutate(
          { code: savedItem.code, nameTh: savedItem.zone ?? savedItem.nameTh, province: savedItem.province },
          {
            onSuccess: () => { toast.success('เพิ่มเขตพื้นที่สำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      }
    } else if (activeTab === 'licenseTypes') {
      if (savedItem.id) {
        updateLt.mutate(
          { nameTh: savedItem.name ?? savedItem.nameTh, agencyId: savedItem.agencyId, validityYears: parseInt(savedItem.duration) || 1, description: savedItem.law },
          {
            onSuccess: () => { toast.success('แก้ไขประเภทใบอนุญาตสำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      } else {
        createLt.mutate(
          { code: savedItem.code, nameTh: savedItem.name ?? savedItem.nameTh, agencyId: savedItem.agencyId, validityYears: parseInt(savedItem.duration) || 1, description: savedItem.law },
          {
            onSuccess: () => { toast.success('เพิ่มประเภทใบอนุญาตสำเร็จ'); setIsModalOpen(false); },
            onError: (e: any) => toast.error(e?.message ?? 'เกิดข้อผิดพลาด'),
          },
        );
      }
    }
  };

  const isLoading = (activeTab === 'agencies' && agenciesLoading) || (activeTab === 'locations' && zonesLoading) || (activeTab === 'licenseTypes' && ltLoading);
  const isError = (activeTab === 'agencies' && agenciesError) || (activeTab === 'locations' && zonesError) || (activeTab === 'licenseTypes' && ltError);
  const onRefetch = activeTab === 'agencies' ? refetchAgencies : activeTab === 'locations' ? refetchZones : refetchLt;

  return (
    <div className="space-y-[16px]">
      {/* Tabs navigation row */}
      <div className="flex border-b border-gray-200 gap-8 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[14px] font-medium transition-all relative cursor-pointer ${
              activeTab === tab.id ? 'text-brand-primary font-bold' : 'text-placeholder hover:text-main'
            }`}
          >
            {tab.label}
            {tab.readOnly && (
              <span className="ml-1.5 text-[10px] text-placeholder font-normal">(อ่านอย่างเดียว)</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-full animate-in fade-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Actions Row */}
      {!isReadOnly && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleAddClick}
            className="bg-brand-primary hover:bg-brand-primary/95 text-white rounded-square px-[14px] py-1.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-smooth-low h-9 cursor-pointer"
          >
            <Plus className="size-4" />
            {activeTab === 'agencies' ? 'เพิ่มหน่วยงาน' : activeTab === 'licenseTypes' ? 'เพิ่มประเภทใบอนุญาต' : 'เพิ่มจังหวัด/เขตพื้นที่'}
          </Button>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-[13px] text-placeholder">
          <span>โหลดข้อมูลไม่สำเร็จ</span>
          <button onClick={() => onRefetch()} className="text-brand-primary hover:underline font-semibold">ลองใหม่</button>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-[32px] gap-2 text-placeholder text-[13px]">
              <RefreshCw className="animate-spin size-4" /> กำลังโหลด...
            </div>
          ) : (
            <>
              {/* Agencies (live CRUD) */}
              {activeTab === 'agencies' && (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-fuji-light/30 border-b border-gray-200">
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">รหัส</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[300px]">ชื่อหน่วยงาน</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">แหล่งข้อมูล</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">สถานะ API</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[100px]">ใบอนุญาต</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[100px]">สถานะ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.length === 0 ? (
                      <tr><td colSpan={7} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">ไม่มีข้อมูลหน่วยงาน</td></tr>
                    ) : agencies.map((row) => (
                      <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                        <td className="px-[16px] py-[12px] text-[13px] font-bold text-brand-primary font-mono">{row.code}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{row.nameTh}</td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold ${row.dataSource === 'API' ? 'bg-sky-bright text-sky-dark' : 'bg-fuji-light text-placeholder'}`}>
                            {row.dataSource === 'API' ? 'API' : 'CSV Import'}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold ${
                            row.apiStatus === 'CONNECTED' ? 'bg-[#d0fae5] text-[#007a55]' :
                            row.apiStatus === 'DISCONNECTED' ? 'bg-[#fff1f0] text-[#cf1322]' :
                            'bg-fuji-light text-placeholder'
                          }`}>
                            {row.apiStatus === 'CONNECTED' ? 'เชื่อมต่อแล้ว' : row.apiStatus === 'DISCONNECTED' ? 'ขาดการเชื่อมต่อ' : 'Manual'}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{row.licenseTypeCount}</td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold ${row.isActive ? 'bg-[#d0fae5] text-[#007a55]' : 'bg-fuji-light text-placeholder'}`}>
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-center">
                          <button onClick={() => handleEditClick({ id: row.id, code: row.code, nameTh: row.nameTh, nameEn: row.nameEn, dataSource: row.dataSource, apiStatus: row.apiStatus, isActive: row.isActive })}
                            className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                            แก้ไข
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* License Types */}
              {activeTab === 'licenseTypes' && (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-fuji-light/30 border-b border-gray-200">
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[200px]">ชื่อ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">รหัส</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">อายุ (ปี)</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">หน่วยงาน</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[100px]">สถานะ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseTypes.length === 0 ? (
                      <tr><td colSpan={6} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">ไม่มีข้อมูล</td></tr>
                    ) : licenseTypes.map((row) => (
                      <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                        <td className="px-[16px] py-[12px] text-[13px] font-bold text-main">{row.nameTh}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium font-mono">{row.code}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{row.validityYears} ปี</td>
                        <td className="px-[16px] py-[12px]">
                          <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                            {agencies.find((a) => a.id === row.agencyId)?.code ?? row.agencyId.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold ${row.isActive ? 'bg-[#d0fae5] text-[#007a55]' : 'bg-fuji-light text-placeholder'}`}>
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-center">
                          <button onClick={() => handleEditClick({
                            id: row.id, name: row.nameTh, code: row.code, duration: String(row.validityYears), agencyId: row.agencyId, law: row.description ?? '',
                          })} className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                            แก้ไข
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Locations/Zones */}
              {activeTab === 'locations' && (
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-fuji-light/30 border-b border-gray-200">
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">รหัส</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[260px]">จังหวัด</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder">ชื่อเขตพื้นที่ (ภาษาไทย)</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[100px]">สถานะ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder text-center w-[100px]">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.length === 0 ? (
                      <tr><td colSpan={5} className="px-[16px] py-[32px] text-center text-placeholder text-[13px]">ไม่มีข้อมูลเขตพื้นที่</td></tr>
                    ) : zones.map((row) => (
                      <tr key={row.id} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                        <td className="px-[16px] py-[12px] text-[13px] font-bold text-main font-mono">{row.code}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{row.province}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-sky-dark font-mono font-medium">{row.nameTh}</td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold ${row.isActive ? 'bg-[#d0fae5] text-[#007a55]' : 'bg-fuji-light text-placeholder'}`}>
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-center">
                          <button onClick={() => handleEditClick({
                            id: row.id, code: row.code, province: row.province, zone: row.nameTh, region: '',
                          })} className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                            แก้ไข
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Statuses (read-only) */}
              {activeTab === 'statuses' && (
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-fuji-light/30 border-b border-gray-200">
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[180px]">รหัสสถานะ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[160px]">ชื่อสถานะ</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[360px]">คำอธิบาย</th>
                      <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder">Next Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATUSES_STATIC.map((row) => (
                      <tr key={row.statusCode} className="border-b border-fuji-light hover:bg-fuji-light/10 transition-colors">
                        <td className="px-[16px] py-[12px] text-[13px] font-bold text-main font-mono">{row.statusCode}</td>
                        <td className="px-[16px] py-[12px]">
                          <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[11px] font-bold leading-tight ${statusColorClass(row.color)}`}>
                            {row.statusName}
                          </span>
                        </td>
                        <td className="px-[16px] py-[12px] text-[13px] text-placeholder font-medium">{row.description}</td>
                        <td className="px-[16px] py-[12px] text-[13px] text-main font-medium">{row.nextAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Master Data Dialog Modal — only for editable tabs */}
      {!isReadOnly && (
        <MasterDataModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          category={activeTab as MasterDataCategory}
          item={editingItem}
          onSave={handleSave}
          agencies={agencies}
          existingLicenseTypes={licenseTypes.map((lt) => lt.nameTh)}
        />
      )}
    </div>
  );
}
