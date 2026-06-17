'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  HardDrive,
  Database,
  Calendar,
  Clock,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const API_LOGS_MOCK = [
  { time: '09:14:32', agency: 'DIW', endpoint: '/api/v1/license/verify', code: 200, latency: '142 ms', status: 'success' },
  { time: '09:13:11', agency: 'ACFS', endpoint: '/api/v1/license/status', code: 200, latency: '98 ms', status: 'success' },
  { time: '09:11:55', agency: 'FDA', endpoint: '/api/v1/token/refresh', code: 401, latency: '55 ms', status: 'error' },
  { time: '09:10:22', agency: 'DIW', endpoint: '/api/v1/license/verify', code: 200, latency: '167 ms', status: 'success' },
  { time: '09:08:40', agency: 'DBD', endpoint: '/api/v1/agency/list', code: 504, latency: '5012 ms', status: 'error' },
  { time: '09:07:18', agency: 'ACFS', endpoint: '/api/v1/license/verify', code: 200, latency: '110 ms', status: 'success' },
];

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

export function ConnectionsDashboard() {
  const [activeTab, setActiveTab] = React.useState<'connections' | 'status'>('connections');
  const [logs, setLogs] = React.useState(API_LOGS_MOCK);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshLogs = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate new logs
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog = {
        time: timeStr,
        agency: ['DIW', 'ACFS', 'FDA', 'DBD'][Math.floor(Math.random() * 4)],
        endpoint: ['/api/v1/license/verify', '/api/v1/license/status', '/api/v1/token/refresh'][Math.floor(Math.random() * 3)],
        code: [200, 200, 401, 504][Math.floor(Math.random() * 4)],
        latency: `${Math.floor(Math.random() * 200) + 40} ms`,
        status: Math.random() > 0.25 ? 'success' : 'error',
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 5)]);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-[16px]">
      {/* Tabs navigation row */}
      <div className="flex border-b border-gray-200 gap-8 mb-4">
        <button
          onClick={() => setActiveTab('connections')}
          className={`pb-3 text-[14px] font-medium transition-all relative cursor-pointer ${
            activeTab === 'connections'
              ? 'text-brand-primary font-bold'
              : 'text-placeholder hover:text-main'
          }`}
        >
          การเชื่อมต่อระบบ
          {activeTab === 'connections' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-full animate-in fade-in duration-300" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-3 text-[14px] font-medium transition-all relative cursor-pointer ${
            activeTab === 'status'
              ? 'text-brand-primary font-bold'
              : 'text-placeholder hover:text-main'
          }`}
        >
          สถานะระบบ
          {activeTab === 'status' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary rounded-full animate-in fade-in duration-300" />
          )}
        </button>
      </div>

      {activeTab === 'connections' ? (
        <div className="space-y-[16px]">
          {/* Top Row: External API Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Tang Rat */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-3 items-start">
              <div className="text-semantic-warning mt-1 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <h3 className="text-[13px] font-bold text-main">
                  ทางรัฐ (mToken/Consumer-Key)
                </h3>
                <p className="text-[11px] font-bold text-[#ad8306] leading-none">
                  สถานะ: Consumer-Key ใกล้หมดอายุ
                </p>
                <p className="text-[11px] text-placeholder font-medium leading-none">
                  วันหมดอายุ Key: <span className="text-orange-600 font-bold">30/06/2568</span>
                </p>
                <div className="pt-1">
                  <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                    รีเฟรช Key
                  </button>
                </div>
              </div>
            </Card>

            {/* Card 2: DIW */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-3 items-start">
              <div className="text-semantic-success mt-1 bg-green-50 p-2 rounded-lg border border-green-100">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <h3 className="text-[13px] font-bold text-main">
                  DIW
                </h3>
                <p className="text-[11px] text-placeholder font-bold leading-none">
                  สถานะ: Manual Batch Import (i-Industry)
                </p>
                <p className="text-[11px] text-placeholder font-medium leading-none">
                  วันนำเข้าล่าสุด: <span className="text-main font-bold">14/08/2568 23:00</span>
                </p>
              </div>
            </Card>

            {/* Card 3: GDX / ACFS */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex gap-3 items-start">
              <div className="text-red-500 mt-1 bg-red-50 p-2 rounded-lg border border-red-100">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <h3 className="text-[13px] font-bold text-main">
                  GDX / มกอช. (ACFS)
                </h3>
                <p className="text-[11px] font-bold text-red-500 leading-none">
                  สถานะการเชื่อมต่อ: Timeout
                </p>
                <p className="text-[11px] text-placeholder font-medium leading-none">
                  เวลาเรียกล่าสุด: <span className="text-main font-bold">15/08/2568 09:01</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Middle Section: API Call Log */}
          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low overflow-hidden bg-white">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-fuji-light/10">
              <h2 className="text-[13px] font-bold text-main text-left">
                API Call Log
              </h2>
              <button
                onClick={handleRefreshLogs}
                disabled={isRefreshing}
                className="text-[12px] text-placeholder hover:text-main font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                รีเฟรช
              </button>
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
                  {logs.map((row, i) => (
                    <tr key={i} className="border-b border-fuji-light/50 hover:bg-fuji-light/5 transition-colors">
                      <td className="px-[16px] py-[10px] text-[12px] text-placeholder font-medium font-mono">{row.time}</td>
                      <td className="px-[16px] py-[10px]">
                        <span className="bg-sky-bright text-sky-dark border border-sky-light rounded-[4px] px-2 py-0.5 text-[11px] font-bold font-mono">
                          {row.agency}
                        </span>
                      </td>
                      <td className="px-[16px] py-[10px] text-[12px] text-main font-mono">{row.endpoint}</td>
                      <td className={`px-[16px] py-[10px] text-[12px] font-bold font-mono ${row.code === 200 ? 'text-[#007a55]' : 'text-[#c71b1b]'}`}>
                        {row.code}
                      </td>
                      <td className="px-[16px] py-[10px] text-[12px] text-main font-mono font-medium">{row.latency}</td>
                      <td className="px-[16px] py-[10px]">
                        <span
                          className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[10px] font-bold leading-tight ${
                            row.status === 'success'
                              ? 'bg-[#d0fae5] text-[#007a55]'
                              : 'bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]'
                          }`}
                        >
                          {row.status === 'success' ? 'สำเร็จ' : 'ผิดพลาด'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Grid: 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Column 1: Server/DB Status */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col justify-between text-left">
              <h2 className="text-[12px] font-semibold text-placeholder mb-3">
                สถานะ Server/Database
              </h2>
              <div className="space-y-2.5 flex-1">
                {[
                  { name: 'Web Server', state: 'Online', success: true },
                  { name: 'Database', state: 'Online', success: true },
                  { name: 'Redis Cache', state: 'Online', success: true },
                  { name: 'File Storage', state: 'Warning (78%)', success: false },
                ].map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[12px]">
                    <span className="text-[#364153] font-medium">{s.name}</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      {s.success ? (
                        <>
                          <CheckCircle2 className="size-4 text-[#007a55]" />
                          <span className="text-[#007a55] font-mono">{s.state}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-4 text-[#ad8306]" />
                          <span className="text-[#ad8306] font-mono">{s.state}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Column 2: Graph Requests */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col text-left">
              <h2 className="text-[12px] font-semibold text-placeholder mb-3">
                กราฟ Request/Error ต่อวัน
              </h2>
              <div className="flex-1 w-full min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA_MOCK} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#707993' }}
                      dy={5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#707993' }}
                    />
                    <Bar dataKey="requests" fill="#2970ff" radius={[2, 2, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Column 3: Storage usage */}
            <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 flex flex-col justify-between text-left">
              <h2 className="text-[12px] font-semibold text-placeholder mb-3">
                การใช้พื้นที่จัดเก็บข้อมูล
              </h2>
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
                      <div
                        className={`${store.colorClass} h-1.5 rounded-full`}
                        style={{ width: `${store.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Uptime Status List */}
          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="size-4 text-brand-primary" />
              <h2 className="text-[13px] font-bold text-main">
                สถานะระบบโดยรวม
              </h2>
            </div>
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
                    <span className={`${s.bg} ${s.text} px-2 py-0.5 rounded-[4px] text-[10px] font-bold`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Maintenance Timetable */}
          <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4 text-brand-primary" />
              <h2 className="text-[13px] font-bold text-main">
                Maintenance Schedule
              </h2>
            </div>
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
