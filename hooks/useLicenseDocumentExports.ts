import { useMutation } from "@tanstack/react-query";
import { getDgaNativeContext, saveFileWithDgaNative } from "@/lib/dga-native";

export type LicenseDocumentExportFormat = "pdf" | "xlsx" | "csv";

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
) {
  const nativeContext = await getDgaNativeContext();
  const nativeDelivery = nativeContext.isNative;
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
      fileName: string;
      downloadUrl: string;
    };
    const saved = await saveFileWithDgaNative(
      nativeFile.downloadUrl,
      nativeFile.fileName,
    );
    if (saved) return;

    // The SDK may become unavailable during a WebView transition. A presigned
    // URL is still safe to open and gives the officer a normal download path.
    window.open(nativeFile.downloadUrl, "_blank", "noopener,noreferrer");
    return;
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
}

export function useLicenseDocumentExport(businessId: string) {
  return useMutation({
    mutationFn: (payload: {
      format: LicenseDocumentExportFormat;
      licenseIds: string[];
    }) => exportLicenseDocuments(businessId, payload),
  });
}
