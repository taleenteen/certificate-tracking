import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InspectionTaskCardAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

interface InspectionTaskCardProps {
  companyName: string;
  businessType?: string;
  inspectionDateTime?: string;
  location?: string;
  inspectorName?: string;
  certificateNumber?: number;
  detailsHref?: string;
  onDetailsClick?: () => void;
  submitLabel?: string;
  onSubmitClick?: () => void;
  primaryAction?: InspectionTaskCardAction;
  secondaryAction?: InspectionTaskCardAction;
  className?: string;
}

export function InspectionTaskCard({
  companyName,
  businessType,
  inspectionDateTime,
  location,
  inspectorName,
  certificateNumber,
  detailsHref,
  onDetailsClick,
  submitLabel = "ส่งออกข้อมูล",
  onSubmitClick,
  primaryAction,
  secondaryAction,
  className,
}: InspectionTaskCardProps) {
  const resolvedSecondaryAction: InspectionTaskCardAction =
    secondaryAction ?? {
      label: "ดูรายละเอียด",
      href: detailsHref,
      onClick: onDetailsClick,
      variant: "secondary",
    };

  const resolvedPrimaryAction: InspectionTaskCardAction =
    primaryAction ?? {
      label: submitLabel,
      onClick: onSubmitClick,
      variant: "primary",
    };

  return (
    <Card
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      <CardContent className="space-y-3.5 p-3">
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold leading-6 text-slate-950">
            {companyName}
          </h3>

          <div className="h-px bg-slate-200" />

          <div className="space-y-1 text-[13px] leading-6 text-slate-800/70">
            {businessType && (
              <p>
                <span className="text-slate-700">ประเภทธุรกิจ : </span>
                <span>{businessType}</span>
              </p>
            )}
            {inspectionDateTime && (
              <p>
                <span className="text-slate-700">วันเวลาที่ตรวจ : </span>
                <span>{inspectionDateTime}</span>
              </p>
            )}
            {location && (
              <p>
                <span className="text-slate-700">จังหวัด/เขต : </span>
                <span>{location}</span>
              </p>
            )}
            {inspectorName && (
              <p>
                <span className="text-slate-700">ผู้ตรวจ : </span>
                <span>{inspectorName}</span>
              </p>
            )}
            {certificateNumber !== undefined && (
              <p>
                <span className="text-slate-700">ใบอนุญาต : </span>
                <span>{certificateNumber}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InspectionTaskCardButton action={resolvedSecondaryAction} />
          <InspectionTaskCardButton action={resolvedPrimaryAction} />
        </div>
      </CardContent>
    </Card>
  );
}

function InspectionTaskCardButton({
  action,
}: {
  action: InspectionTaskCardAction;
}) {
  const className =
    action.variant === "secondary"
      ? "h-9 rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-800 hover:bg-slate-100"
      : "h-9 rounded-lg bg-[#114e4b] text-sm text-white hover:bg-[#0d403d]";

  if (action.href) {
    return (
      <Button
        asChild
        variant={action.variant === "secondary" ? "outline" : "default"}
        className={className}
      >
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={action.variant === "secondary" ? "outline" : "default"}
      onClick={action.onClick}
      className={className}
    >
      {action.label}
    </Button>
  );
}
