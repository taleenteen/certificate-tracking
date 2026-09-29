"use client";

import { useCallback, useState } from "react";

function formatError(error: unknown, licenseNumber: string) {
  const message = error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
  return licenseNumber ? message.replaceAll(licenseNumber, "[redacted]") : message;
}

export function useLicenseCopyDiagnostics() {
  const [isCopied, setIsCopied] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);

  const append = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString("th-TH", { hour12: false });
    setEntries((current) => [...current.slice(-9), `${time} ${message}`]);
  }, []);

  const copy = async (licenseNumber: string) => {
    setEntries([]);
    append("ได้รับเหตุการณ์กดปุ่ม (onClick)");
    append(
      `secure=${window.isSecureContext}, focus=${document.hasFocus()}, activation=${navigator.userActivation?.isActive ?? "unknown"}, protocol=${window.location.protocol}`,
    );
    append(
      `clipboard=${typeof navigator.clipboard}, writeText=${typeof navigator.clipboard?.writeText}`,
    );
    append(`userAgent=${navigator.userAgent}`);

    let pendingTimer: number | undefined;
    try {
      if (typeof navigator.clipboard?.writeText !== "function") {
        throw new TypeError("navigator.clipboard.writeText ไม่มีใน WebView นี้");
      }
      append("เริ่มเรียก writeText()");
      pendingTimer = window.setTimeout(
        () => append("writeText() ยังไม่ตอบกลับหลัง 3 วินาที"),
        3_000,
      );
      await navigator.clipboard.writeText(licenseNumber);
      append("writeText() สำเร็จ");
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1_500);
    } catch (error) {
      append(`writeText() ล้มเหลว: ${formatError(error, licenseNumber)}`);
      setIsCopied(false);
    } finally {
      if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);
    }
  };

  return { copy, entries, isCopied };
}

export function LicenseCopyDiagnostics({ entries }: { entries: string[] }) {
  return (
    <section
      aria-label="บันทึกการคัดลอกเลขใบอนุญาต"
      aria-live="polite"
      className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-left text-xs text-slate-800 select-text"
    >
      <p className="font-bold">Clipboard debug (ชั่วคราว)</p>
      <p className="mt-1">
        {entries.length === 0
          ? "รอกดปุ่มคัดลอกเลขใบอนุญาต"
          : "ผลจากการกดครั้งล่าสุด"}
      </p>
      {entries.length > 0 && (
        <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
          {entries.join("\n")}
        </pre>
      )}
    </section>
  );
}
