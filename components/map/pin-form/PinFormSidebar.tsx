import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Search, MapPinned, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PinFormValues } from "../pin-schema";
import { PinCategory, PinType } from "@/types/api";
import { DEVICE_TYPE_OPTIONS, AttributeConfig } from "./constants";
import { CategoryOption, CATEGORY_NAMES } from "./hooks/usePinCategories";
import { ApiZone } from "@/services/zone.service";
import { ApiParcel } from "@/services/parcel.service";
import { ApiFloor } from "@/services/floor.service";
import { PIN_ICON_MAP } from "../pin-icon-map";

interface PinFormSidebarProps {
  form: UseFormReturn<PinFormValues>;
  pinMode: "device" | "info";
  setPinMode: (mode: "device" | "info") => void;
  dataId: string;
  setDataId: (id: string) => void;
  // Options
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  zones: ApiZone[];
  isLoadingZones: boolean;
  parcels: ApiParcel[];
  isLoadingParcels: boolean;
  floors: ApiFloor[];
  isLoadingFloors: boolean;
  // Actions
  onZoneChange: (zoneId: string) => void;
  onParcelChange: (parcelId: string) => void;
  onDeletePoint: (index: number) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoadingSubmit: boolean;
  isEditMode: boolean;
  // Attributes config
  currentAttributes: AttributeConfig[];
}

export function PinFormSidebar({
  form,
  pinMode,
  setPinMode,
  dataId,
  setDataId,
  categories,
  isLoadingCategories,
  zones,
  isLoadingZones,
  parcels,
  isLoadingParcels,
  floors,
  isLoadingFloors,
  onZoneChange,
  onParcelChange,
  onDeletePoint,
  onSubmit,
  isLoadingSubmit,
  isEditMode,
  currentAttributes,
}: PinFormSidebarProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const title = watch("title");
  const isPublic = watch("isPublic");
  const type = watch("type") as PinType;
  const category = watch("category");
  const subtype = watch("subtype");
  const selectedZoneId = watch("zoneId");
  const selectedParcelId = watch("parcelId");
  const selectedFloorId = watch("floorId");
  const attributes = watch("attributes") || {};
  const points = watch("points") || [];
  const polygonGeometry = watch("polygonGeometry");
  const locationType = watch("locationType");

  const currentSubtypes = React.useMemo(() => {
    return categories.find((c) => c.category === category)?.subtypes || [];
  }, [categories, category]);

  const handleAttributeChange = (key: string, checked: boolean) => {
    const currentAttrs = { ...attributes };
    if (checked) {
      currentAttrs[key] = "";
    } else {
      delete currentAttrs[key];
    }
    setValue("attributes", currentAttrs, { shouldValidate: true });
  };

  return (
    <div className="col-span-5 flex flex-col bg-white p-0 overflow-y-auto pr-2">
      <CardHeader className="border-b border-gray-200 space-y-1 p-0 pb-3 sticky top-0 bg-white z-10">
        <CardTitle className="text-xl font-bold p-0">
          {isEditMode ? "แก้ไขหมุด" : "เพิ่มหมุดใหม่"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-0 px-1 pt-4 pb-4">
        {/* Visibility */}
        <Field>
          <FieldLabel className="text-xs text-gray-500">
            ตั้งค่าการมองเห็น
          </FieldLabel>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={(v) =>
                setValue("isPublic", v, { shouldValidate: true })
              }
            />
            <Label htmlFor="public" className="font-normal">
              สาธารณะ
            </Label>
          </div>
          <FieldError errors={[errors.isPublic]} />
        </Field>

        {/* Pin Mode Selection */}
        <Field>
          <FieldLabel className="text-xs text-gray-500">
            ประเภทหมุดหลัก
          </FieldLabel>
          <RadioGroup
            value={pinMode}
            onValueChange={(v) => setPinMode(v as "device" | "info")}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="device"
                id="mode-device"
                className="text-green-600 border-green-600"
              />
              <Label htmlFor="mode-device" className="cursor-pointer">
                e-Service (Device)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="info" id="mode-info" />
              <Label htmlFor="mode-info" className="cursor-pointer">
                Info Pin
              </Label>
            </div>
          </RadioGroup>
        </Field>

        {/* Category/Type Dropdowns */}
        <Field>
          <FieldLabel className="text-sm font-medium">
            ประเภทรายละเอียด <span className="text-red-500">*</span>
          </FieldLabel>
          {pinMode === "device" ? (
            <Select
              value={type}
              onValueChange={(v) =>
                setValue("type", v as PinType, { shouldValidate: true })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="เลือกประเภทอุปกรณ์" />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-3 mt-2">
              <Select
                value={category}
                onValueChange={(v) =>
                  setValue("category", v as PinCategory, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoadingCategories}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? "กำลังโหลดหมวดหมู่..."
                        : "เลือกหมวดหมู่ Info"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.nameTh ||
                        CATEGORY_NAMES[cat.category] ||
                        cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentSubtypes.length > 0 && (
                <Select
                  value={subtype}
                  onValueChange={(v) =>
                    setValue("subtype", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทหมุดย่อย" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSubtypes.map((s) => {
                      const IconComponent = PIN_ICON_MAP[s.code];
                      return (
                        <SelectItem key={s.code} value={s.code}>
                          <div className="flex items-center gap-2">
                            {IconComponent && (
                              <IconComponent className="w-4 h-4 text-gray-500" />
                            )}
                            <span>{s.nameTh || s.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <FieldError errors={[errors.category, errors.type, errors.subtype]} />
        </Field>

        {/* Zone Selector */}
        <Field>
          <FieldLabel className="text-sm font-medium flex items-center gap-1">
            <MapPinned className="w-4 h-4" />
            เลือกโซน{" "}
            {pinMode === "device" && <span className="text-red-500">*</span>}
          </FieldLabel>
          <Select
            value={selectedZoneId}
            onValueChange={onZoneChange}
            disabled={isLoadingZones}
          >
            <SelectTrigger className="mt-2">
              <SelectValue
                placeholder={
                  isLoadingZones ? "กำลังโหลดโซน..." : "เลือกโซนที่ต้องการ"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {zones.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  ยังไม่มีโซน กรุณาสร้างโซนก่อน
                </div>
              ) : (
                zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.color || "#3B82F6" }}
                      />
                      <span>{zone.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.zoneId]} />
          {!selectedZoneId && pinMode === "device" && !errors.zoneId && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ ต้องเลือกโซนก่อนสร้างหมุด (สำหรับอุปกรณ์)
            </p>
          )}
        </Field>

        {/* Parcel Selector */}
        {selectedZoneId && (
          <Field>
            <FieldLabel className="text-sm font-medium flex items-center gap-1">
              🏠 เลือกแปลง (ถ้ามี)
            </FieldLabel>
            <Select
              value={selectedParcelId}
              onValueChange={onParcelChange}
              disabled={isLoadingParcels}
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    isLoadingParcels
                      ? "กำลังโหลดแปลง..."
                      : parcels.length === 0
                        ? "ไม่มีแปลงในโซนนี้"
                        : "เลือกแปลง (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {parcels.map((parcel) => (
                  <SelectItem key={parcel.id} value={parcel.id}>
                    {parcel.name}
                    {parcel.ownerName && ` (${parcel.ownerName})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.parcelId]} />
          </Field>
        )}

        {/* Floor Selector */}
        {selectedParcelId && (
          <Field>
            <FieldLabel className="text-sm font-medium flex items-center gap-1">
              🏢 เลือกชั้น (ถ้ามี)
            </FieldLabel>
            <Select
              value={selectedFloorId}
              onValueChange={(v) =>
                setValue("floorId", v, { shouldValidate: true })
              }
              disabled={isLoadingFloors}
            >
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={
                    isLoadingFloors
                      ? "กำลังโหลดชั้น..."
                      : floors.length === 0
                        ? "ไม่มีชั้นในแปลงนี้"
                        : "เลือกชั้น (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id}>
                    ชั้น {floor.level} {floor.name && `- ${floor.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.floorId]} />
          </Field>
        )}

        {/* Inputs */}
        <Field>
          <FieldLabel className="text-sm font-medium">
            ชื่อหมุด <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            placeholder="ชื่อหมุด"
            className="mt-2"
            value={title}
            onChange={(e) =>
              setValue("title", e.target.value, { shouldValidate: true })
            }
          />
          <FieldError errors={[errors.title]} />

          <FieldLabel className="text-sm font-medium mt-4">Data ID</FieldLabel>
          <Input
            placeholder="Data ID (Optional)"
            className="mt-2"
            value={dataId}
            onChange={(e) => setDataId(e.target.value)}
          />
        </Field>

        {/* Attributes Checklist */}
        <div className="space-y-3">
          <h4 className="font-bold text-lg">ประเภทที่จะแสดง</h4>
          <div className="h-px bg-gray-100 w-full" />
          <Field>
            <FieldError errors={[errors.attributes]} />
            {currentAttributes.map((item) => (
              <div key={item.key} className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={item.key in attributes}
                    onChange={(e) =>
                      handleAttributeChange(item.key, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <Label htmlFor={item.key} className="font-normal text-sm">
                    {item.label}
                  </Label>
                </div>
                {item.key in attributes && (
                  <Input
                    placeholder={`ระบุค่า ${item.label}`}
                    className="h-8 text-xs ml-6 w-[calc(100%-1.5rem)]"
                    value={attributes[item.key]}
                    onChange={(e) =>
                      setValue(
                        "attributes",
                        { ...attributes, [item.key]: e.target.value },
                        { shouldValidate: true },
                      )
                    }
                  />
                )}
              </div>
            ))}
          </Field>
        </div>

        {/* Selected Points Preview */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-bold text-sm">พิกัด</h4>
          <FieldError
            errors={[
              errors.points,
              errors.polygonGeometry,
              errors.locationType,
            ]}
          />

          {points.length === 0 && (
            <div
              className={`text-sm text-center py-4 border border-dashed rounded-lg ${errors.points ? "text-red-500 border-red-500 bg-red-50" : "text-gray-400"}`}
            >
              คลิกบนแผนที่ทางขวาเพื่อเพิ่มจุด
            </div>
          )}

          {points.map((point: any, index: number) => (
            <div
              key={point.id || index}
              className="space-y-1 p-2 border rounded-lg bg-gray-50 relative"
            >
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs text-gray-500">
                  จุดที่ {index + 1}
                </Label>
                <button
                  onClick={() => onDeletePoint(point.id)}
                  className="text-gray-400 hover:text-red-500"
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={point.lat.toFixed(6)}
                  readOnly
                  className="h-8 text-xs bg-white text-gray-500"
                />
                <Input
                  value={point.lng.toFixed(6)}
                  readOnly
                  className="h-8 text-xs bg-white text-gray-500"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
