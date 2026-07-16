"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getDgaNativeContext } from "@/lib/dga-native";

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

  useEffect(() => {
    let active = true;

    void getDgaNativeContext().then(({ sdk, isNative }) => {
      if (!active || !sdk || !isNative) return;

      const showBackButton = pathname !== "/home";
      sdk.setTitle?.(pageTitle(pathname), showBackButton);
      sdk.setBackButtonVisible?.(showBackButton);
      sdk.setCaptureButtonVisible?.(true);
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
