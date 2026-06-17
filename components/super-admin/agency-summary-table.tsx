import { Card } from '@/components/ui/card';

export function AgencySummaryTable() {
  const tableData = [
    { agency: 'DIW', full: 'กรมโรงงานฯ', types: ['ร.ง.4', 'วัตถุอันตราย'], staff: 12, licenses: '1,840', status: 'ปกติ', statusBg: 'bg-[#d0fae5]', statusText: 'text-[#007a55]' },
    { agency: 'ACFS', full: 'มกอช.', types: ['ใบอนุญาตผลิต', 'ใบอนุญาตนำเข้า', 'GAP/HACCP'], staff: 22, licenses: '3,210', status: 'ปกติ', statusBg: 'bg-[#d0fae5]', statusText: 'text-[#007a55]' },
    { agency: 'FDA', full: 'อย.', types: ['ใบอนุญาตผลิต', 'ใบสำคัญอาหาร'], staff: 18, licenses: '2,540', status: 'ตรวจสอบ', statusBg: 'bg-[#fef3c6]', statusText: 'text-[#bb4d00]' },
    { agency: 'DBD', full: 'กรมพัฒนาธุรกิจฯ', types: ['ใบทะเบียนพาณิชย์'], staff: 7, licenses: '980', status: 'ปกติ', statusBg: 'bg-[#d0fae5]', statusText: 'text-[#007a55]' },
    { agency: 'MOL', full: 'กรมแรงงาน', types: ['ใบอนุญาตทำงาน'], staff: '—', licenses: '—', status: 'ผิดปกติ', statusBg: 'bg-[#ffe2e2]', statusText: 'text-[#c10007]' },
  ];

  return (
    <div className="w-full space-y-[12px]">
      <h2 className="text-[14px] font-semibold text-[#1c2b3a] leading-[20px]">
        สรุปข้อมูลต่อหน่วยงาน
      </h2>
      
      <Card className="rounded-[12px] border-[#e5e7eb] border-[0.8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[195px]">หน่วยงาน</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[447px]">ประเภทใบอนุญาตที่รับผิดชอบ</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[147px]">จำนวน Admin</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[161px]">จำนวนเจ้าหน้าที่</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] text-center w-[170px]">จำนวนใบอนุญาต</th>
                <th className="px-[12px] py-[8px] text-[12px] font-semibold text-[#4a5565] border-b-[0.8px] border-[#e5e7eb] w-[134px]">สถานะข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-[12px] py-[10px] border-b-[0.8px] border-[#f3f4f6]">
                    <div className="flex items-center gap-[4px]">
                      <span className="text-[12px] font-bold text-[#4a9b72] font-mono leading-[16px]">{row.agency}</span>
                      <span className="text-[12px] text-[#7a8fa6] font-normal leading-[16px]">{row.full}</span>
                    </div>
                  </td>
                  <td className="px-[12px] py-[8px] border-b-[0.8px] border-[#f3f4f6]">
                    <div className="flex flex-wrap gap-[4px] items-center">
                      {row.types.map((t, ti) => (
                        <span key={ti} className="bg-[#f3f4f6] text-[#4a5565] text-[12px] font-medium px-[8px] py-[2px] rounded-[4px] leading-[16px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">{row.staff}</td>
                  <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">{row.staff}</td>
                  <td className="px-[12px] py-[10px] text-center text-[12px] text-[#1c2b3a] border-b-[0.8px] border-[#f3f4f6]">{row.licenses}</td>
                  <td className="px-[12px] py-[8px] border-b-[0.8px] border-[#f3f4f6]">
                    <span className={`${row.statusBg} ${row.statusText} text-[12px] font-medium px-[8px] py-[2px] rounded-[4px] inline-block leading-[16px]`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
