import React from "react";
import { Popup } from "react-map-gl/mapbox";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MapPopupProps {
  popupInfo: any;
  onClose: () => void;
  onEdit?: () => void;
}

export default function MapPopup({
  popupInfo,
  onClose,
  onEdit,
}: MapPopupProps) {
  const getAttr = (key: string, defaultValue: any = "") => {
    return popupInfo[key] || defaultValue;
  };

  const attributes =
    popupInfo.attributes && typeof popupInfo.attributes === "object"
      ? Object.entries(popupInfo.attributes)
      : [];

  return (
    <Popup
      anchor="top"
      latitude={popupInfo.lat}
      longitude={popupInfo.lng}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      className="custom-popup z-50 p-0"
      maxWidth="360px"
      offset={1}
    >
      <div className="min-w-[300px] rounded-xl border bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {popupInfo.type && <Badge variant="secondary">{popupInfo.type}</Badge>}
              {popupInfo.category && <Badge variant="outline">{popupInfo.category}</Badge>}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {popupInfo.title || "Untitled pin"}
              </h3>
              {popupInfo.subtypeNameTh || popupInfo.subtype ? (
                <p className="text-sm text-slate-500">
                  {popupInfo.subtypeNameTh || popupInfo.subtype}
                </p>
              ) : null}
            </div>
          </div>
          {onEdit ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="แก้ไข"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>

        {popupInfo.description ? (
          <p className="mb-3 text-sm leading-6 text-slate-600">
            {popupInfo.description}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <InfoRow label="Status" value={popupInfo.status} />
          <InfoRow label="Data ID" value={popupInfo.dataId} />
          <InfoRow label="Owner" value={getAttr("ownerName") || getAttr("owner")} />
          <InfoRow label="Location" value={getAttr("location")} />
        </div>

        {attributes.length > 0 ? (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Attributes
            </p>
            <div className="space-y-2">
              {attributes.slice(0, 6).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-500">{key}</span>
                  <span className="truncate text-right font-medium text-slate-800">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Popup>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="truncate font-medium text-slate-800">{value || "-"}</p>
    </div>
  );
}
