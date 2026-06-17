import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: any;
  title: string;
  subTitle: string;
  value: string | number;
  change?: string;
  iconBgClass: string;
  iconTextClass: string;
}

export function StatCard({ 
  icon: Icon, 
  title, 
  subTitle, 
  value, 
  change, 
  iconBgClass,
  iconTextClass
}: StatCardProps) {
  return (
    <Card className="rounded-[12px] border-[#e5e7eb] border-[0.8px] border-solid drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] bg-white overflow-hidden shadow-none">
      <CardContent className="p-[16.8px] pb-[20.8px]">
        <div className="flex gap-[10px] items-start">
          <div className={`p-1.5 rounded-[8px] size-[32px] flex items-center justify-center ${iconBgClass} ${iconTextClass}`}>
            <Icon className="size-[16px]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[12px] font-semibold text-[#1c2b3a] leading-[15px]">{title}</h3>
            <p className="text-[10px] text-[#7a8fa6] font-normal leading-[12.5px] mt-[2px]">{subTitle}</p>
          </div>
        </div>
        <div className="mt-[16px] flex items-end justify-between">
          <span className="text-[24px] font-bold text-[#1c2b3a] leading-[32px] relative top-[-1.2px]">{value}</span>
          {change && (
            <div className="flex items-center gap-[2px] bg-[#ecfdf5] text-[#009966] rounded-full px-[8px] py-[2px] text-[11px] font-semibold leading-[16.5px]">
              <TrendingUp className="size-[10px]" />
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
