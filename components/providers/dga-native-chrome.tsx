"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDgaNativeRuntime } from "./dga-native-runtime";

const PAGE_TITLES: Record<string, string> = {
  "/home": "e-License",
  "/licenses": "ใบอนุญาตของฉัน",
  "/license-search": "ค้นหาใบอนุญาต",
  "/businesses": "สถานประกอบการ",
  "/e-map": "แผนที่สถานประกอบการ",
  "/profile": "ข้อมูลส่วนตัว",
  "/reports": "รายการส่งออก",
};

function pageTitle(pathname: string) {
  if (pathname.startsWith("/licenses/")) return "รายละเอียดใบอนุญาต";
  if (pathname.startsWith("/businesses/")) return "รายละเอียดสถานประกอบการ";
  if (pathname.startsWith("/officer/inspections/")) return "รายละเอียดรายการ";
  return PAGE_TITLES[pathname] ?? "e-License";
}

export function DgaNativeChrome() {
  const pathname = usePathname();
  const { sdk, isNative } = useDgaNativeRuntime();

  useEffect(() => {
    if (!sdk || !isNative) return;

    const showBackButton = pathname !== "/home";
    try {
      sdk.setTitle?.(pageTitle(pathname), showBackButton);
      sdk.setBackButtonVisible?.(showBackButton);
      sdk.setCaptureButtonVisible?.(true);
    } catch {
      // Native chrome is optional UI enhancement; feature actions handle
      // unavailable SDK capability explicitly.
    }
  }, [isNative, pathname, sdk]);

  return null;
}
