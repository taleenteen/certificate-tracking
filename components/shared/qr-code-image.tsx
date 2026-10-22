"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type QrCodeImageProps = {
  /** Payload encoded into the QR. */
  value: string;
  /** Rendered size in CSS pixels. */
  size?: number;
  alt: string;
  className?: string;
};

// DECISION: QR codes are rendered locally on a canvas. The officer card encodes
// a short-lived identity token, and routing it through a third-party image
// service (api.qrserver.com) would put that token in someone else's URL logs.
export function QrCodeImage({
  value,
  size = 176,
  alt,
  className,
}: QrCodeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    let cancelled = false;

    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(() => {
        if (!cancelled) setFailed(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to render QR code:", err);
        setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-slate-50 text-center text-[11px] font-semibold text-slate-400"
        style={{ width: size, height: size }}
      >
        แสดง QR Code ไม่สำเร็จ
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
