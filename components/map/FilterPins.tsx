import React from "react";
import {
  Monitor,
  Map as MapIcon,
  Shield,
  AlertTriangle,
  Trash2,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterPinsProps {
  onClose?: () => void;
  activeLayer: string | null;
  onLayerChange: (layer: string | null) => void;
}

export function FilterPins({
  onClose,
  activeLayer,
  onLayerChange,
}: FilterPinsProps) {
  const eServices = [
    {
      id: "water",
      label: "ระบบตรวจสอบปริมาณ\nและคุณภาพน้ำ",
      icon: Monitor,
      bg: "bg-teal-50",
    },
    // ... (other items remain same, just need to make sure I don't delete them)
    {
      id: "tax",
      label: "ระบบบริหาร\nจัดการแผนที่ภาษี",
      icon: MapIcon,
      bg: "bg-teal-50",
    },
    {
      id: "security",
      label: "ระบบความปลอดภัย",
      icon: Shield,
      bg: "bg-teal-50",
    },
    {
      id: "disaster",
      label: "ระบบเตือนภัยพิบัติ\nดินสไลด์, น้ำท่วม, ไฟไหม้",
      icon: AlertTriangle,
      bg: "bg-teal-50",
    },
    {
      id: "waste",
      label: "ระบบธนาคารขยะ",
      icon: Trash2,
      bg: "bg-teal-50",
    },
    {
      id: "license",
      label: "ระบบขอใบอนุญาต/\nรับรอง/\nระบบตรวจสอบใบอนุญาต",
      icon: FileText,
      bg: "bg-teal-50",
    },
    {
      id: "monitoring",
      label: "ระบบ Monitoring",
      icon: Zap,
      bg: "bg-amber-50",
    },
  ];

  const infoItems = [
    "จังหวัด",
    "หมู่บ้าน",
    "Zone",
    "อำเภอ",
    "ธนาคาร",
    "Block",
    "ตำบล",
    "เขื่อน",
    "ที่ดิน",
    "ขอบเขต อปท.",
    "สถานีรถไฟ",
    "สิ่งปลูกสร้าง",
    "ทางรถไฟ",
    "สถานีตำรวจ",
    "ทางหลวงชนบท",
    "สนามบิน",
    "โรงพยาบาล",
    "ที่สาธารณะประโยชน์",
    "หมู่บ้าน",
    "ที่ราชพัสดุ",
  ];

  const handleServiceClick = (id: string) => {
    if (activeLayer === id) {
      onLayerChange(null); // Toggle off
    } else {
      onLayerChange(id); // Toggle on
    }
  };

  return (
    <Card className="w-[600px] h-[800px] shadow-2xl border-0 rounded-xl overflow-hidden flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* e-Service Section */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">e-Service</h2>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 relative">
            {/* Left Arrow (Mock) */}
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1 border border-gray-100 hidden">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            {eServices.map((service) => {
              const isActive = activeLayer === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={cn(
                    "group flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer h-[180px] text-center gap-4",
                    isActive
                      ? "border-green-500 shadow-md bg-green-50/30"
                      : "border-gray-200 hover:border-green-500 hover:shadow-md bg-white",
                  )}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors",
                      isActive ? "bg-green-100" : service.bg,
                      "group-hover:bg-green-50",
                    )}
                  >
                    <service.icon
                      className={cn(
                        "w-8 h-8 transition-colors",
                        isActive
                          ? "text-green-600"
                          : "text-teal-500 group-hover:text-green-600",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-pre-line leading-tight transition-colors",
                      isActive
                        ? "text-green-700"
                        : "text-gray-700 group-hover:text-green-700",
                    )}
                  >
                    {service.label}
                  </span>
                </div>
              );
            })}

            {/* Right Arrow (Mock) */}
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 border border-gray-100 translate-x-1/2">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-6 my-2" />

        {/* Info Section */}
        <div className="p-6 pt-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Info</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox
                  id={`info-${index}`}
                  className="data-[state=checked]:bg-gray-900 border-gray-400 rounded-md w-5 h-5"
                />
                <Label
                  htmlFor={`info-${index}`}
                  className="text-base font-normal text-gray-700 cursor-pointer"
                >
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Controls (Mocking the position from the image, though usually these are on the map) */}
      {/* Since this is a card overlay, we probably don't need zoom controls INSIDE the card unless requested. 
          The image shows zoom controls outside the card on the map. 
          So I will omit them here. */}
    </Card>
  );
}
