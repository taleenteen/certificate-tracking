'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Calendar,
  Clock,
  FlaskConical,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useSyncStatus, useTriggerDiwImport } from '@/hooks/useSync';
import { useAgencies } from '@/hooks/useAgencies';
import { toast } from 'sonner';

// MOCK: replace with GET /api/system/logs in UAT
const API_LOGS_MOCK = [
  { time: '09:14:32', agency: 'DIW', endpoint: '/api/v1/license/verify', code: 200, latency: '142 ms', status: 'success' },
  { time: '09:13:11', agency: 'ACFS', endpoint: '/api/v1/license/status', code: 200, latency: '98 ms', status: 'success' },
  { time: '09:11:55', agency: 'FDA', endpoint: '/api/v1/token/refresh', code: 401, latency: '55 ms', status: 'error' },
  { time: '09:10:22', agency: 'DIW', endpoint: '/api/v1/license/verify', code: 200, latency: '167 ms', status: 'success' },
  { time: '09:08:40', agency: 'DBD', endpoint: '/api/v1/agency/list', code: 504, latency: '5012 ms', status: 'error' },
];

// MOCK: replace with GET /api/system/metrics/hourly in UAT
const CHART_DATA_MOCK = [
  { hour: '00:00', requests: 10 },
  { hour: '03:00', requests: 15 },
  { hour: '06:00', requests: 20 },
  { hour: '09:00', requests: 65 },
  { hour: '12:00', requests: 80 },
  { hour: '15:00', requests: 50 },
  { hour: '18:00', requests: 35 },
  { hour: '21:00', requests: 25 },
];

function MockBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
      <FlaskConical className="size-3" />
      ข้อมูลจำลอง
    </span>
  );
}

export function ConnectionsDashboard() {
  const [activeTab, setActiveTab] = React.useState<'connections' | 'status'>('connections');

  const { data: syncStatuses, isLoading: syncLoading, refetch: refetchSync } = useSyncStatus();
  const { data: agencies = [] } = useAgencies();
  const triggerDiw = useTriggerDiwImport();

  const diwSync = syncStatuses?.find((s) => s.agency.code === 'DIW');
  const formatSyncDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'short', timeStyle: 'short' });
  };

  const handleTriggerDiw = () => {
    triggerDiw.mutate(undefined, {
      onSuccess: () => { toast.success('เริ่มนำเข้าข้อมูล DIW แล้ว'); refetchSync(); },
      onError: (e: any) => toast.error(e?.message ?? 'ไม่สามารถเริ่มนำเข้าได้'),
    });
  };

  return (
    <div className="space-y-[16px]">
      {/* Tabs navigation row */}
      <div className="flex border-b border-gray-200 gap-8 mb-4">
        {(['connections', 'status'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[14px] font-medium transition-all relative cursor-pointer ${
              activeTab === tab ? 'text-brand-primary font-bold' : 'text-placeholder hover:text-main'
            }`}
          >
            {tab === 'connections' ? 'การเชื่อมต่อระบบ' : 'สถานะระบบ'}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-full animate-in fade-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'connections' ? (
        <div className="space-y-[16px]">
          {/* Top Row: External Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tang Rat — MOCK */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-3 items-start">
              <div className="text-semantic-warning mt-1 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-main">ทางรัฐ (mToken/Consumer-Key)</h3>
                  <MockBadge />
                </div>
                <p className="text-[11px] font-bold text-[#ad8306] leading-none">
                  สถานะ: Consumer-Key ใกล้หมดอายุ
                </p>
                <p className="text-[11px] text-placeholder font-medium leading-none">
                  {/* MOCK: replace with GET /api/system/connections in UAT */}
                  วันหมดอายุ Key: <span className="text-orange-600 font-bold">30/06/2568</span>
                </p>
              </div>
            </Card>

            {/* Per-agency cards — live from useAgencies() + useSyncStatus() */}
            {agencies.map((agency) => {
              const latestSync = syncStatuses?.find((s) => s.agencyId === agency.id);
              const isApi = agency.dataSource === 'API';
              const syncStatus = latestSync?.status;
              const isOk = isApi ? syncStatus === 'SUCCESS' : false;
              const isFailed = isApi ? syncStatus === 'FAILED' : false;
              return (
                <Card key={agency.id} className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-3 items-start">
                  <div className={`mt-1 p-2 rounded-lg border ${
                    isOk ? 'text-semantic-success bg-green-50 border-green-100' :
                    isFailed ? 'text-red-500 bg-red-50 border-red-100' :
                    'text-amber-500 bg-amber-50 border-amber-100'
                  }`}>
                    {syncLoading ? <RefreshCw className="size-5 animate-spin" /> :
                     isOk ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
                  </div>
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold text-main">{agency.code} — {agency.nameTh}</h3>
                      {!isApi && <MockBadge />}
                    </div>
                    <p className="text-[11px] text-placeholder font-bold leading-none">
                      {isApi
                        ? `สถานะ: ${syncLoading ? 'กำลังโหลด...' : syncStatus ?? 'ไม่มีข้อมูล'}`
                        : `API Status: ${agency.apiStatus}`}
                    </p>
                    <p className="text-[11px] text-placeholder font-medium leading-none">
                      ซิงค์ล่าสุด: <span className="text-main font-bold">
                        {formatSyncDate(agency.lastSyncedAt ?? latestSync?.finishedAt ?? latestSync?.startedAt)}
                      </span>
                    </p>
                    {agency.code === 'DIW' && isApi && (
                      <div className="pt-1">
                        <button
                          onClick={handleTriggerDiw}
                          disabled={triggerDiw.isPending}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {triggerDiw.isPending ? 'กำลังเริ่ม...' : 'เริ่มนำเข้าตอนนี้'}
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* API Call Log — MOCK */}
          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-fuji-light/10">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-bold text-main">API Call Log</h2>
                <MockBadge />
              </div>
              {/* MOCK: replace with GET /api/system/logs in UAT */}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-fuji-light/30 border-b border-gray-200">
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">เวลา</th>
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">หน่วยงาน</th>
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[240px]">Endpoint</th>
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">Response Code</th>
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[140px]">เวลาตอบสนอง</th>
                    <th className="px-[16px] py-[10px] text-[12px] font-bold text-placeholder w-[120px]">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {API_LOGS_MOCK.map((row, i) => (
                    <tr key={i} className="border-b border-fuji-light/50 hover:bg-fuji-light/5 transition-colors">
                      <td className="px-[16px] py-[10px] text-[12px] text-placeholder font-medium font-mono">{row.time}</td>
                      <td className="px-[16px] py-[10px]">
                        <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">{row.agency}</span>
                      </td>
                      <td className="px-[16px] py-[10px] text-[12px] text-main font-mono">{row.endpoint}</td>
                      <td className={`px-[16px] py-[10px] text-[12px] font-bold font-mono ${row.code === 200 ? 'text-[#007a55]' : 'text-[#c71b1b]'}`}>{row.code}</td>
                      <td className="px-[16px] py-[10px] text-[12px] text-main font-mono font-medium">{row.latency}</td>
                      <td className="px-[16px] py-[10px]">
                        <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[10px] font-bold leading-tight ${
                          row.status === 'success' ? 'bg-[#d0fae5] text-[#007a55]' : 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]'
                        }`}>
                          {row.status === 'success' ? 'สำเร็จ' : 'ผิดพลาด'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Grid — MOCK */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col text-left">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[12px] font-semibold text-placeholder">สถานะ Server/Database</h2>
                <MockBadge />
              </div>
              {/* MOCK: replace with GET /api/system/health in UAT */}
              <div className="space-y-2.5 flex-1">
                {[
                  { name: 'Web Server', state: 'Online', ok: true },
                  { name: 'Database', state: 'Online', ok: true },
                  { name: 'Redis Cache', state: 'Online', ok: true },
                  { name: 'File Storage', state: 'Warning (78%)', ok: false },
                ].map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[12px]">
                    <span className="text-[#364153] font-medium">{s.name}</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      {s.ok ? (
                        <><CheckCircle2 className="size-4 text-[#007a55]" /><span className="text-[#007a55] font-mono">{s.state}</span></>
                      ) : (
                        <><AlertCircle className="size-4 text-[#ad8306]" /><span className="text-[#ad8306] font-mono">{s.state}</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col text-left">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[12px] font-semibold text-placeholder">กราฟ Request/Error ต่อวัน</h2>
                <MockBadge />
              </div>
              {/* MOCK: replace with GET /api/system/metrics/hourly in UAT */}
              <div className="flex-1 w-full min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA_MOCK} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#707993' }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#707993' }} />
                    <Bar dataKey="requests" fill="#2970ff" radius={[2, 2, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col text-left">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[12px] font-semibold text-placeholder">การใช้พื้นที่จัดเก็บข้อมูล</h2>
                <MockBadge />
              </div>
              {/* MOCK: replace with GET /api/system/uptimes in UAT */}
              <div className="space-y-3">
                {[
                  { name: 'ไฟล์เอกสาร', percent: 65, colorClass: 'bg-blue-600' },
                  { name: 'ฐานข้อมูล', percent: 42, colorClass: 'bg-blue-600' },
                  { name: 'Audit Log', percent: 28, colorClass: 'bg-blue-600' },
                  { name: 'Backup', percent: 78, colorClass: 'bg-[#f8842d]' },
                ].map((store, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-[#364153]">
                      <span>{store.name}</span>
                      <span className="font-bold font-mono">{store.percent}%</span>
                    </div>
                    <div className="w-full bg-fuji-light rounded-full h-1.5 overflow-hidden">
                      <div className={`${store.colorClass} h-1.5 rounded-full`} style={{ width: `${store.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Status Tab — MOCK */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="size-4 text-brand-primary" />
              <h2 className="text-[13px] font-bold text-main">สถานะระบบโดยรวม</h2>
              <MockBadge />
            </div>
            {/* MOCK: replace with GET /api/system/uptimes in UAT */}
            <div className="divide-y divide-fuji-light">
              {[
                { name: 'E-License Platform', uptime: '99.9%', status: 'Online', bg: 'bg-[#d0fae5]', text: 'text-[#007a55]' },
                { name: 'mToken Integration', uptime: '97.2%', status: 'Degraded', bg: 'bg-[#fffbe6]', text: 'text-[#d48806]' },
                { name: 'i-Industry (DIW)', uptime: '100%', status: 'Online', bg: 'bg-[#d0fae5]', text: 'text-[#007a55]' },
                { name: 'GDX (ACFS)', uptime: '88.5%', status: 'Offline', bg: 'bg-[#fff1f0]', text: 'text-[#cf1322]' },
              ].map((s, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-[12px]">
                  <span className="font-medium text-[#364153]">{s.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-placeholder font-semibold font-mono">{s.uptime}</span>
                    <span className={`${s.bg} ${s.text} px-2 py-0.5 rounded-[4px] text-[10px] font-bold`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4 text-brand-primary" />
              <h2 className="text-[13px] font-bold text-main">Maintenance Schedule</h2>
              <MockBadge />
            </div>
            {/* MOCK: replace with GET /api/system/maintenance in UAT */}
            <div className="space-y-4">
              {[
                { date: '20/06/2568 02:00', title: 'Database maintenance window', dur: '2 ชม.' },
                { date: '30/06/2568 00:00', title: 'mToken Consumer-Key renewal', dur: '30 นาที' },
                { date: '01/07/2568 22:00', title: 'System backup & archive', dur: '4 ชม.' },
              ].map((m, idx) => (
                <div key={idx} className="flex gap-3 items-start text-[12px] pb-3 border-b border-fuji-light last:border-0 last:pb-0">
                  <div className="text-placeholder flex items-center gap-1 font-mono font-medium mt-0.5 shrink-0 w-[120px]">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{m.date}</span>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="font-bold text-main leading-tight">{m.title}</h4>
                    <p className="text-[11px] text-placeholder font-medium">ระยะเวลา: {m.dur}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
