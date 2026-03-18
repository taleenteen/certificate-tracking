// components/ui/section-card.tsx (หรือโฟลเดอร์ที่เก็บ shared component)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  headerAction?: ReactNode; // เผื่อเคสที่การ์ดกลางมี text "3 รายการ" ตรงมุมขวา
}

export function SectionCard({
  icon,
  title,
  children,
  headerAction,
}: SectionCardProps) {
  return (
    <Card className="p-2 mb-4 border border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </div>
        {headerAction && (
          <div className="text-sm text-muted-foreground">{headerAction}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-2">{children}</CardContent>
    </Card>
  );
}
