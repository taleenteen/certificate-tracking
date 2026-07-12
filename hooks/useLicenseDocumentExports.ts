import { useMutation } from "@tanstack/react-query";

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
  const response = await fetch(
    `/api/officer/businesses/${businessId}/license-document-exports`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
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
