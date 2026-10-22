"use client";

import { useState } from "react";
import { Check, Copy, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useLicenseDocumentExport,
  NativeExportError,
  type LicenseDocumentExportFormat,
} from "@/hooks/useLicenseDocumentExports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExportableLicense = {
  id: string;
  title: string;
  licenseNumber: string;
};

type LicenseDocumentExportDialogProps = {
  businessId: string;
  licenses: ExportableLicense[];
  triggerButton?: React.ReactNode;
};

const formatOptions: Array<{
  value: LicenseDocumentExportFormat;
  label: string;
}> = [
  { value: "pdf", label: "PDF สำหรับพิมพ์" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV" },
];

const nativeDebugEnabled = process.env.NEXT_PUBLIC_DGA_NATIVE_DEBUG === "true";

export function LicenseDocumentExportDialog({
  businessId,
  licenses,
  triggerButton,
}: LicenseDocumentExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<LicenseDocumentExportFormat>("pdf");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const exportDocuments = useLicenseDocumentExport(businessId);

  const toggleLicense = (license: ExportableLicense) => {
    setSelectedIds((current) => {
      if (current.includes(license.id)) {
        return current.filter((id) => id !== license.id);
      }
      return [...current, license.id];
    });
  };

  const submit = async () => {
    const result = await exportDocuments.mutateAsync({
      format,
      licenseIds: selectedIds,
    });
    if (nativeDebugEnabled && result.delivery === "native") return;
    setOpen(false);
    setSelectedIds([]);
  };
  const nativeError =
    exportDocuments.error instanceof NativeExportError
      ? exportDocuments.error
      : null;
  const nativeDebug =
    exportDocuments.data?.nativeDebug ?? nativeError?.diagnostics.nativeDebug;
  const copyDiagnostic = async (label: string, value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiedValue(label);
    window.setTimeout(() => setCopiedValue(null), 1_500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setSelectedIds([]);
          exportDocuments.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button className="gap-2" disabled={licenses.length === 0}>
            <FileDown className="h-4 w-4" />
            Export เอกสาร
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export เอกสารใบอนุญาต</DialogTitle>
          <DialogDescription>
            เลือกใบอนุญาตที่ต้องการเพื่อสร้างเอกสารอ้างอิงจากแพลตฟอร์ม
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label
            className="block text-sm font-medium text-slate-700"
            htmlFor="export-format"
          >
            รูปแบบไฟล์
          </label>
          <Select
            value={format}
            onValueChange={(val) => setFormat(val as LicenseDocumentExportFormat)}
          >
            <SelectTrigger id="export-format" className="w-full bg-white text-slate-800 border-slate-200">
              <SelectValue placeholder="เลือกรูปแบบไฟล์" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800">
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-slate-50 text-slate-800">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">ใบอนุญาต</p>
          <div className="max-h-64 divide-y overflow-y-auto rounded-md border">
            {licenses.map((license) => {
              const isSelected = selectedIds.includes(license.id);
              return (
                <label
                  key={license.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-3"
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={exportDocuments.isPending}
                    onCheckedChange={() => toggleLicense(license)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {license.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {license.licenseNumber}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {exportDocuments.error && (
            <p className="text-sm text-destructive">
              {exportDocuments.error.message}
            </p>
          )}
          {nativeDebugEnabled && (exportDocuments.data?.delivery === "native" || nativeError) && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
              <p className="font-semibold">UAT native export diagnostics</p>
              <p className="mt-1">SDK request: {exportDocuments.data?.nativeSaveRequested ? "sent" : "not confirmed"}</p>
              <p>Download origin: {exportDocuments.data?.downloadOrigin ?? nativeError?.diagnostics.downloadOrigin ?? "unknown"}</p>
              <p>URL lifetime: {exportDocuments.data?.downloadUrlExpiresInSeconds ?? nativeError?.diagnostics.downloadUrlExpiresInSeconds ?? "unknown"} seconds</p>
              {nativeDebug && (
                <div className="mt-3 space-y-2 border-t border-amber-300 pt-3">
                  <p className="font-medium">Backend response</p>
                  <pre className="max-h-40 overflow-auto rounded border border-amber-200 bg-white p-2 text-[11px] leading-4 whitespace-pre-wrap break-all">
                    {JSON.stringify(nativeDebug.backendResponse, null, 2)}
                  </pre>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 border-amber-400 bg-white text-amber-950"
                    onClick={() => copyDiagnostic("response", JSON.stringify(nativeDebug.backendResponse, null, 2))}
                  >
                    {copiedValue === "response" ? <Check /> : <Copy />}
                    Copy backend response
                  </Button>
                  <p className="pt-1 font-medium">Tang Rat SDK call</p>
                  <pre className="max-h-32 overflow-auto rounded border border-amber-200 bg-white p-2 text-[11px] leading-4 whitespace-pre-wrap break-all">
                    {`window.czpSdk.${nativeDebug.sdkCall.method}(\n  ${JSON.stringify(nativeDebug.sdkCall.url)},\n  ${JSON.stringify(nativeDebug.sdkCall.fileName)},\n);`}
                  </pre>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 border-amber-400 bg-white text-amber-950"
                    onClick={() => copyDiagnostic("sdk-call", `window.czpSdk.${nativeDebug.sdkCall.method}(\n  ${JSON.stringify(nativeDebug.sdkCall.url)},\n  ${JSON.stringify(nativeDebug.sdkCall.fileName)},\n);`)}
                  >
                    {copiedValue === "sdk-call" ? <Check /> : <Copy />}
                    Copy SDK call
                  </Button>
                </div>
              )}
              <p className="mt-3 text-amber-800">UAT only: the copied presigned URL grants temporary access until it expires. Do not share it publicly.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={selectedIds.length === 0 || exportDocuments.isPending}
          >
            {exportDocuments.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <FileDown />
            )}
            สร้างไฟล์
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
