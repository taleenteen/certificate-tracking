"use client";

import { useCallback, useState } from "react";

function formatError(error: unknown, licenseNumber: string) {
  const message = error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
  return licenseNumber ? message.replaceAll(licenseNumber, "[redacted]") : message;
}

function copyWithSelection(value: string) {
  const textarea = document.createElement("textarea");
  const previouslyFocused = document.activeElement;
  textarea.value = value;
  textarea.readOnly = true;
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  textarea.style.userSelect = "text";
  document.body.appendChild(textarea);

  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
      try {
        previouslyFocused.focus({ preventScroll: true });
      } catch {
        // Restoring focus must not hide a successful copy result.
      }
    }
  }
}

export function useLicenseCopyDiagnostics() {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [entries, setEntries] = useState<string[]>([]);

  const append = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString("th-TH", { hour12: false });
    setEntries((current) => [...current.slice(-9), `${time} ${message}`]);
  }, []);

  const copy = async (licenseNumber: string) => {
    setCopyError(null);
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
      try {
        append(
          `เริ่มวิธีสำรอง execCommand("copy"), activation=${navigator.userActivation?.isActive ?? "unknown"}`,
        );
        const copied = copyWithSelection(licenseNumber);
        append(`execCommand("copy") คืนค่า ${copied}`);
        if (!copied) throw new Error("WebView ไม่ยอมคัดลอกข้อความที่เลือก");
        setIsCopied(true);
        window.setTimeout(() => setIsCopied(false), 1_500);
      } catch (fallbackError) {
        append(`วิธีสำรองล้มเหลว: ${formatError(fallbackError, licenseNumber)}`);
        setIsCopied(false);
        setCopyError("ไม่สามารถคัดลอกเลขใบอนุญาตได้ใน WebView นี้");
      }
    } finally {
      if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);
    }
  };

  return { copy, copyError, entries, isCopied };
}

export function LicenseCopyDiagnostics({ entries }: { entries: string[] }) {
  const latestEntry = entries.at(-1);

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
      {latestEntry && <p className="mt-2 font-semibold break-all">ล่าสุด: {latestEntry}</p>}
      {entries.length > 0 && (
        <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
          {entries.join("\n")}
        </pre>
      )}
    </section>
  );
}
