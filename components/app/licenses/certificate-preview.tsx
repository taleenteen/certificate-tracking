"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import licenseImg from "@/assets/license.png";

type CertificatePreviewProps = {
  previewUrl?: string | null;
  className?: string;
  size?: "card" | "detail";
};

export function CertificatePreview({
  previewUrl,
  className,
  size = "card",
}: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    const renderFirstPage = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loadingTask = pdfjs.getDocument({ url: previewUrl });
        const documentProxy = await loadingTask.promise;
        destroy = () => {
          loadingTask.destroy();
          void documentProxy.cleanup();
        };
        const page = await documentProxy.getPage(1);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: size === "detail" ? 2.0 : 1.4 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error("Failed to render PDF preview:", err);
        if (!cancelled) setHasError(true);
      }
    };

    void renderFirstPage();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [previewUrl, size]);

  if (!previewUrl || hasError) {
    return (
      <Image
        src={licenseImg}
        alt="ใบอนุญาต"
        fill={size === "card"}
        width={size === "detail" ? 400 : undefined}
        height={size === "detail" ? 560 : undefined}
        className={size === "card" ? "object-cover object-center" : "object-contain mx-auto"}
        sizes={size === "card" ? "(max-width: 430px) 150px, 200px" : undefined}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="หน้าแรกของเอกสารใบอนุญาต"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "contain",
      }}
    />
  );
}
