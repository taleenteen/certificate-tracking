'use client';

import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const chartData = [
  { date: '10 มิ.ย.', val1: 40, val2: 18, val3: 5 },
  { date: '11 มิ.ย.', val1: 55, val2: 22, val3: 8 },
  { date: '12 มิ.ย.', val1: 38, val2: 15, val3: 3 },
  { date: '13 มิ.ย.', val1: 60, val2: 30, val3: 11 },
  { date: '14 มิ.ย.', val1: 48, val2: 18, val3: 6 },
  { date: '15 มิ.ย.', val1: 42, val2: 25, val3: 9 },
];

export function TrendChart() {
  return (
    <Card className="rounded-[12px] border border-gray-200 shadow-smooth-low bg-white p-4 h-full flex flex-col min-h-[241px]">
      <h2 className="text-[12px] font-semibold text-placeholder mb-4">
        กราฟแนวโน้มการออกใบอนุญาตรวมทั้งระบบ
      </h2>
      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4a9b72" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4a9b72" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#666' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#666' }} 
              ticks={[0, 20, 40, 60, 80]}
            />
            <Area type="monotone" dataKey="val1" stroke="#4a9b72" strokeWidth={2} fillOpacity={1} fill="url(#colorVal1)" />
            <Area type="monotone" dataKey="val2" stroke="#f59e0b" strokeWidth={2} fill="none" />
            <Area type="monotone" dataKey="val3" stroke="#ef4444" strokeWidth={2} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
