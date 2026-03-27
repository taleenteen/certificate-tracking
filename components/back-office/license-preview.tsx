import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

export type LicensePreviewType = "document" | "seal";

type LicensePreviewProps = {
  type: LicensePreviewType;
  label?: string;
  size?: "card" | "detail";
  className?: string;
};

export function LicensePreview({
  type,
  label,
  size = "card",
  className,
}: LicensePreviewProps) {
  if (type === "seal") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-[inherit] bg-white",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-4 border-[#2d57bb] text-[#2d57bb]",
            size === "detail" ? "h-24 w-24" : "h-12 w-12",
          )}
        >
          <FileText className={cn(size === "detail" ? "h-10 w-10" : "h-6 w-6")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-[inherit] border border-slate-200 bg-white",
        size === "detail"
          ? "min-h-[360px] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          : "min-h-[170px] p-3",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,0)_100%)]" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="space-y-3">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-300 text-[9px] font-semibold text-rose-500">
            คพ.
          </div>

          <div className="space-y-1.5">
            <div className="mx-auto h-2 w-32 rounded-full bg-slate-200" />
            <div className="mx-auto h-1.5 w-24 rounded-full bg-slate-200" />
            <div className="mx-auto h-1.5 w-20 rounded-full bg-slate-200" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: size === "detail" ? 7 : 4 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full bg-slate-200",
                  index % 3 === 0 && "w-full",
                  index % 3 === 1 && "w-5/6",
                  index % 3 === 2 && "w-4/6",
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div className="space-y-2">
              <div className="h-8 w-20 rounded-full border border-rose-200" />
              <div className="h-1.5 w-24 rounded-full bg-slate-200" />
            </div>
            <div className="flex justify-end">
              <div
                className={cn(
                  "rounded-full border-2 border-sky-400",
                  size === "detail" ? "h-12 w-12" : "h-8 w-8",
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: size === "detail" ? 3 : 2 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full bg-slate-200",
                  index === 0 ? "w-2/3" : "w-1/2",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {label && (
        <p className="absolute bottom-3 left-4 text-[9px] text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
}
