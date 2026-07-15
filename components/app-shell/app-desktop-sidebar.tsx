"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Building2,
  FileText,
  Home,
  IdCard,
  Map,
  Search,
  UserRound,
} from "lucide-react";

import mainLogo from "@/assets/icon/main-logo.svg";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof Home;
  matches?: (pathname: string) => boolean;
};

const publicNavigation: NavigationItem[] = [
  { href: "/home", label: "หน้าแรก", icon: Home },
  {
    href: "/licenses",
    label: "ใบอนุญาตของฉัน",
    icon: FileText,
    matches: (pathname) => pathname === "/licenses" || pathname.startsWith("/licenses/"),
  },
  { href: "/license-search", label: "ค้นหาใบอนุญาต", icon: Search },
  {
    href: "/businesses",
    label: "สถานประกอบการ",
    icon: Building2,
    matches: (pathname) => pathname === "/businesses" || pathname.startsWith("/businesses/"),
  },
  { href: "/e-map", label: "e-Map", icon: Map },
];

const officerNavigation: NavigationItem[] = [
  { href: "/home?entry=officer", label: "หน้าแรก", icon: Home, matches: (pathname) => pathname === "/home" },
  { href: "/license-search", label: "ค้นหาใบอนุญาต", icon: Search },
  {
    href: "/businesses",
    label: "สถานประกอบการ",
    icon: Building2,
    matches: (pathname) => pathname === "/businesses" || pathname.startsWith("/businesses/"),
  },
  { href: "/e-map", label: "e-Map", icon: Map },
  { href: "/officer-card", label: "บัตรเจ้าหน้าที่", icon: IdCard },
];

export function AppDesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const activePortalMode = useAuthStore((state) => state.activePortalMode);
  const portalMode = activePortalMode ?? searchParams.get("entry");
  const isOfficerMode =
    user?.roles?.includes("officer") && portalMode === "officer";
  const navigation = isOfficerMode ? officerNavigation : publicNavigation;

  return (
    <aside className="sticky top-[73px] hidden h-[calc(100dvh-97px)] w-64 shrink-0 self-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] lg:fixed lg:left-[max(1.5rem,calc((100vw_-_1536px)_/_2_+_1.5rem))] lg:top-24 lg:h-[calc(100dvh-120px)] lg:z-20 lg:flex lg:flex-col">
      <Link href={isOfficerMode ? "/home?entry=officer" : "/home?entry=public"} className="flex items-center px-2 pb-6">
        <Image
          src={mainLogo}
          alt="E-License Verification Platform"
          width={156}
          height={35}
          className="h-8 w-auto object-contain"
        />
      </Link>

      <nav aria-label="เมนูหลัก" className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.matches
            ? item.matches(pathname)
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#e7f2f1] text-[#07543c]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/profile"
        className="mt-auto flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
      >
        <UserRound className="size-5" aria-hidden="true" />
        <span>โปรไฟล์</span>
      </Link>
    </aside>
  );
}
