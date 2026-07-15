"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import licenseImg from "@/assets/license.png";

type CertificatePreviewProps = {
  /** Preferred: load PDF via same-origin BFF → backend stream (avoids MinIO CORS / mixed content). */
  licenseId?: string | null;
  /** Fallback: direct presigned MinIO URL (works only if CORS + host are correct). */
  previewUrl?: string | null;
  className?: string;
  size?: "card" | "detail";
};

function isRenderingCancelledError(error: unknown) {
  return (
    error instanceof Error && error.name === "RenderingCancelledException"
  );
}

/**
 * Renders page 1 of a certificate PDF into a canvas.
 * Prefer `licenseId` so the browser fetches `/api/licenses/:id/certificate`
 * (same-origin) instead of hitting MinIO presigned URLs from the client.
 */
export function CertificatePreview({
  licenseId,
  previewUrl,
  className,
  size = "card",
}: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const sourceUrl = useMemo(() => {
    if (licenseId) {
      return `/api/licenses/${encodeURIComponent(licenseId)}/certificate`;
    }
    if (!previewUrl) return null;

    // HTTPS pages cannot fetch http:// MinIO hosts (mixed content). Drop them.
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      previewUrl.startsWith("http://")
    ) {
      return null;
    }
    return previewUrl;
  }, [licenseId, previewUrl]);

  useEffect(() => {
    setHasError(false);
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl || !canvasRef.current) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    const renderFirstPage = async () => {
      setIsRendering(true);
      try {
        const pdfjs = await import("pdfjs-dist");

        // Use CDN worker matching installed package version — reliable in Next
        // standalone production builds where bundler worker URLs often break.
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjs.getDocument({
          url: sourceUrl,
          withCredentials: false,
          // Disable range/stream so one full GET works through BFF without
          // needing MinIO Accept-Ranges + CORS preflight gymnastics.
          disableRange: true,
          disableStream: true,
        });
        const documentProxy = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          await documentProxy.cleanup();
          return;
        }

        destroy = () => {
          void loadingTask.destroy();
          void documentProxy.cleanup();
        };
        const page = await documentProxy.getPage(1);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({
          scale: size === "detail" ? 2.0 : 1.4,
        });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (!cancelled) setHasError(false);
      } catch (err) {
        if (cancelled || isRenderingCancelledError(err)) return;
        console.error("Failed to render PDF preview:", err);
        setHasError(true);
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    };

    void renderFirstPage();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [sourceUrl, size]);

  if (!sourceUrl || hasError) {
    return (
      <Image
        src={licenseImg}
        alt="ใบอนุญาต"
        fill={size === "card"}
        width={size === "detail" ? 400 : undefined}
        height={size === "detail" ? 560 : undefined}
        className={
          size === "card"
            ? "object-cover object-center"
            : "object-contain mx-auto"
        }
        sizes={size === "card" ? "(max-width: 430px) 150px, 200px" : undefined}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      {isRendering ? (
        <div className="absolute inset-0 animate-pulse rounded-[inherit] bg-slate-100" />
      ) : null}
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
    </div>
  );
}
