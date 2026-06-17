import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function SystemAlertList() {
  const alerts = [
    { msg: '- Consumer-Key ใกล้หมดอายุ', type: 'warning' },
    { msg: '- การซิงค์ข้อมูลล้มเหลว', type: 'warning' },
    { msg: '- บัญชี Admin ที่ยังไม่มีหน่วยงานในสังกัด', type: 'warning' }
  ];

  return (
    <Card className="rounded-[12px] border border-border-default shadow-smooth-low bg-white p-[16.8px] flex flex-col h-full min-h-[241px]">
      <h2 className="text-[12px] font-semibold text-text-placeholder mb-3">
        รายการแจ้งเตือนระดับระบบ
      </h2>
      
      <div className="space-y-[8px] flex-1 mt-1">
        {alerts.map((item, i) => (
          <div key={i} className="flex gap-[8px] items-start">
            <div className="text-saffron-medium-dark mt-0.5">
              <AlertCircle className="size-[14px]" />
            </div>
            <p className="text-[12px] text-[#364153] font-normal leading-[16px]">
              {item.msg}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
