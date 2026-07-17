import { useMutation } from "@tanstack/react-query";
import { saveFileWithDgaNative } from "@/lib/dga-native";
import {
  useDgaNativeRuntime,
  type DgaNativeRuntime,
} from "@/components/providers/dga-native-runtime";

export type LicenseDocumentExportFormat = "pdf" | "xlsx" | "csv";

export type LicenseDocumentExportResult = {
  delivery: "browser" | "native";
  nativeSaveRequested?: boolean;
  downloadOrigin?: string;
  downloadUrlExpiresInSeconds?: number;
  nativeDebug?: {
    backendResponse: {
      id?: string;
      referenceNo?: string;
      fileName: string;
      contentType?: string;
      downloadUrl: string;
      downloadOrigin: string;
      downloadUrlExpiresInSeconds: number;
    };
    sdkCall: {
      method: "sendFileToNativeWithUrl";
      url: string;
      fileName: string;
    };
  };
};

export class NativeExportError extends Error {
  constructor(
    message: string,
    public readonly diagnostics: Pick<
      LicenseDocumentExportResult,
      "downloadOrigin" | "downloadUrlExpiresInSeconds" | "nativeDebug"
    >,
  ) {
    super(message);
    this.name = "NativeExportError";
  }
}

function fileNameFromDisposition(value: string | null, fallback: string) {
  const match = value?.match(
    /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i,
  );
  const encoded = match?.[1] ?? match?.[2];
  return encoded ? decodeURIComponent(encoded) : fallback;
}

async function exportLicenseDocuments(
  businessId: string,
  payload: { format: LicenseDocumentExportFormat; licenseIds: string[] },
  currentRuntime: DgaNativeRuntime,
) {
  const runtime =
    currentRuntime.status === "web"
      ? currentRuntime
      : await currentRuntime.refresh();
  if (runtime.status === "native-unavailable") {
    throw new NativeExportError(
      "ไม่สามารถเชื่อมต่อการบันทึกไฟล์ของแอปทางรัฐได้ กรุณาปิดและเปิด e-Service ใหม่",
      {},
    );
  }
  if (runtime.isNative && !runtime.canSaveFile) {
    throw new NativeExportError(
      "แอปทางรัฐเวอร์ชันนี้ไม่รองรับการบันทึกไฟล์",
      {},
    );
  }
  const nativeDelivery = runtime.isNative;
  const response = await fetch(
    `/api/officer/businesses/${businessId}/license-document-exports`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...payload,
        ...(nativeDelivery ? { delivery: "native" } : {}),
      }),
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      typeof body?.message === "string"
        ? body.message
        : "ไม่สามารถสร้างไฟล์เอกสารได้",
    );
  }

  if (nativeDelivery) {
    const nativeFile = (await response.json()) as {
      id?: string;
      referenceNo?: string;
      fileName: string;
      contentType?: string;
      downloadUrl: string;
      downloadOrigin: string;
      downloadUrlExpiresInSeconds: number;
    };
    const nativeDebug = {
      backendResponse: nativeFile,
      sdkCall: {
        method: "sendFileToNativeWithUrl" as const,
        url: nativeFile.downloadUrl,
        fileName: nativeFile.fileName,
      },
    };
    try {
      const saved = await saveFileWithDgaNative(
        runtime.sdk,
        nativeFile.downloadUrl,
        nativeFile.fileName,
      );
      if (saved) {
        return {
          delivery: "native",
          nativeSaveRequested: true,
          downloadOrigin: nativeFile.downloadOrigin,
          downloadUrlExpiresInSeconds: nativeFile.downloadUrlExpiresInSeconds,
          nativeDebug,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown SDK error";
      throw new NativeExportError(
        `ไม่สามารถส่งคำขอบันทึกไฟล์ไปยังแอปทางรัฐได้: ${message}`,
        {
          downloadOrigin: nativeFile.downloadOrigin,
          downloadUrlExpiresInSeconds: nativeFile.downloadUrlExpiresInSeconds,
          nativeDebug,
        },
      );
    }

    throw new NativeExportError(
      "ไม่สามารถส่งคำขอบันทึกไฟล์ไปยังแอปทางรัฐได้",
      {
        downloadOrigin: nativeFile.downloadOrigin,
        downloadUrlExpiresInSeconds: nativeFile.downloadUrlExpiresInSeconds,
        nativeDebug,
      },
    );
  }

  const blob = await response.blob();
  const fileName = fileNameFromDisposition(
    response.headers.get("content-disposition"),
    `license-documents.${payload.format}`,
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return { delivery: "browser" };
}

export function useLicenseDocumentExport(businessId: string) {
  const nativeRuntime = useDgaNativeRuntime();
  return useMutation({
    mutationFn: (payload: {
      format: LicenseDocumentExportFormat;
      licenseIds: string[];
    }) => exportLicenseDocuments(businessId, payload, nativeRuntime),
  });
}
