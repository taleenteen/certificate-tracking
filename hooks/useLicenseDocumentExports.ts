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
): Promise<LicenseDocumentExportResult> {
  const runtime =
    currentRuntime.status === "web"
      ? currentRuntime
      : await currentRuntime.refresh();
  const createExport = async (delivery: "native" | "browser") => {
    const response = await fetch(
      `/api/officer/businesses/${businessId}/license-document-exports`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(delivery === "native" ? { delivery: "native" } : {}),
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
    return response;
  };

  const downloadBrowserResponse = async (
    response: Response,
  ): Promise<LicenseDocumentExportResult> => {
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
    return { delivery: "browser" as const };
  };

  const nativeDelivery = runtime.isNative && runtime.canSaveFile;

  if (nativeDelivery) {
    const response = await createExport("native");
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
    } catch {
      // Use the same completed export through the BFF, so native failure does
      // not create a second export record or audit entry.
    }

    try {
      const fallbackResponse = await fetch(
        `/api/officer/license-document-exports/${nativeFile.id}/file`,
      );
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP ${fallbackResponse.status}`);
      }
      return downloadBrowserResponse(fallbackResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown fallback error";
      throw new NativeExportError(
        `ไม่สามารถบันทึกไฟล์ผ่านแอปทางรัฐหรือดาวน์โหลดผ่านเบราว์เซอร์ได้: ${message}`,
        {
          downloadOrigin: nativeFile.downloadOrigin,
          downloadUrlExpiresInSeconds: nativeFile.downloadUrlExpiresInSeconds,
          nativeDebug,
        },
      );
    }
  }

  return downloadBrowserResponse(await createExport("browser"));
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
