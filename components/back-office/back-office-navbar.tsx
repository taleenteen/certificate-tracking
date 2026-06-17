"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  CircleUserRound,
  LogOut,
  ScanSearch,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  BusinessFilterPanel,
  type BusinessCategory,
} from "./business-filter-panel";
import { QrScannerDialog } from "./qr-scanner-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/hooks/useAuth";
import { useAgencies } from "@/hooks/useAgencies";
import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPage {
  data: Notification[];
  meta: { total: number; unread: number };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useNotifications() {
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => http.get<NotificationPage>("my/notifications"),
    staleTime: 30_000,
  });
}

function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch("notifications/read-all", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });
}

// ─── Route config ─────────────────────────────────────────────────────────────

const SEARCH_PAGE_CONFIG: Record<
  string,
  { placeholder: string; action: "filter" | "scan" }
> = {
  "/e-map": { placeholder: "ค้นหาในแผนที่", action: "filter" },
  "/establishment": { placeholder: "ค้นหาสถานประกอบการ", action: "filter" },
  "/reports": { placeholder: "ค้นหารายงาน", action: "filter" },
  "/license-search": { placeholder: "ค้นหาใบอนุญาต", action: "scan" },
};

const DETAIL_PAGE_TITLES: Record<string, string> = {
  "/establishment": "รายละเอียดสถานประกอบการ",
  "/my-licenses": "รายละเอียดใบอนุญาต",
};

const STANDALONE_PAGE_TITLES: Record<string, string> = {
  "/my-licenses": "ใบอนุญาตของฉัน",
  "/expired-licenses": "ใบอนุญาตหมดอายุ",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function BackOfficeNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { data: agencies = [] } = useAgencies();
  const userAgencyName = agencies.find((a) => a.id === user?.agencyId)?.nameTh;

  const searchPageConfig = SEARCH_PAGE_CONFIG[pathname];
  const searchPlaceholder = searchPageConfig?.placeholder;
  const detailPageTitle = getDetailPageTitle(pathname);
  const rawQuery = searchParams.get("q") ?? "";
  const selectedCategories = parseCategories(searchParams.get("categories"));
  const selectedRegion = searchParams.get("region") ?? "";

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<
    "profile" | "notifications" | null
  >(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useNotifications();
  const markAllRead = useMarkAllRead();

  const unreadCount = notifData?.meta?.unread ?? 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notifRef.current?.contains(target) ||
        profileRef.current?.contains(target)
      )
        return;
      setOpenPanel(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenPanel(null);
  }, [pathname]);

  const value = useMemo(
    () => draftValues[pathname] ?? rawQuery,
    [draftValues, pathname, rawQuery],
  );
  const activeFilterCount =
    selectedCategories.length + Number(Boolean(selectedRegion));

  const updateSearch = (nextValue: string) => {
    setDraftValues((current) => ({ ...current, [pathname]: nextValue }));
    if (!searchPlaceholder) return;
    updateUrlParams({ q: nextValue.trim() || null });
  };

  const handleMockScan = async (value: string) => {
    setIsQrScannerOpen(false);
    try {
      await http.get(`licenses/${value}/qr-verify`);
      router.push(`/my-licenses/${value}`);
    } catch {
      toast.error("ไม่พบใบอนุญาตนี้ กรุณาตรวจสอบ QR Code อีกครั้ง");
    }
  };

  const togglePanel = (panel: "profile" | "notifications") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const roleLabel = user?.roles?.includes("super_admin")
    ? "ผู้ดูแลระบบสูงสุด"
    : user?.roles?.includes("admin")
      ? "ผู้ดูแลระบบ"
      : user?.roles?.includes("supervisor")
        ? "ผู้ตรวจสอบอาวุโส"
        : user?.roles?.includes("inspector")
          ? "เจ้าหน้าที่ตรวจสอบ"
          : "ผู้ประกอบการ / ประชาชน";

  return (
    <header className="sticky top-0 z-30 border-white/10 bg-white text-black backdrop-blur">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        {searchPlaceholder ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Go back"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full border border-white/15 bg-white/5 text-black hover:bg-white/10 hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  placeholder={searchPlaceholder}
                  value={value}
                  onChange={(event) => updateSearch(event.target.value)}
                />
                {searchPageConfig?.action === "filter" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Open filters"
                    onClick={() => setIsFilterOpen((current) => !current)}
                    className="relative h-9 w-9 rounded-xl text-[#114e4b] hover:bg-slate-100 hover:text-[#114e4b]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#114e4b] px-1 text-[10px] font-semibold text-black">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Scan QR code"
                    onClick={() => setIsQrScannerOpen(true)}
                    className="h-9 w-9 rounded-xl text-[#114e4b] hover:bg-slate-100 hover:text-[#114e4b]"
                  >
                    <ScanSearch className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {searchPageConfig?.action === "filter" && isFilterOpen && (
              <div className="pointer-events-none absolute left-0 right-0 top-full z-40 pt-0.5 transition-all duration-300 ease-out">
                <div className="pointer-events-auto origin-top transition-transform duration-300 ease-out">
                  <BusinessFilterPanel
                    initialValue={{
                      categories: selectedCategories,
                      region: selectedRegion || undefined,
                    }}
                    onApply={(filters) => {
                      updateUrlParams({
                        categories:
                          filters.categories && filters.categories.length > 0
                            ? filters.categories.join(",")
                            : null,
                        region: filters.region ?? null,
                      });
                      setIsFilterOpen(false);
                    }}
                    onReset={() => {
                      updateUrlParams({ categories: null, region: null });
                      setIsFilterOpen(false);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : detailPageTitle ? (
          <div className="grid grid-cols-[40px_1fr_40px] items-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Go back"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full text-black hover:bg-white/10 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-center text-base font-semibold text-black sm:text-[1.125rem]">
              {detailPageTitle}
            </h1>
            <div aria-hidden="true" className="h-10 w-10" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold leading-tight">
                ยินดีต้อนรับ, {user?.fullName || "ผู้เข้าใช้งาน"}
              </p>
              <p className="mt-1 text-sm text-black/70">
                {userAgencyName || roleLabel}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications button */}
              <div ref={notifRef} className="relative">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Notifications"
                  onClick={() => togglePanel("notifications")}
                  className={cn(
                    "relative h-9 w-9 text-black hover:bg-white/10 hover:text-black",
                    openPanel === "notifications" && "bg-white/10",
                  )}
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>

                {openPanel === "notifications" && (
                  <NotificationsPanel
                    notifications={notifData?.data ?? []}
                    unreadCount={unreadCount}
                    onMarkAll={() => markAllRead.mutate()}
                  />
                )}
              </div>

              {/* Profile button */}
              <div ref={profileRef} className="relative">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Profile"
                  onClick={() => togglePanel("profile")}
                  className={cn(
                    "h-9 w-9 text-black hover:bg-white/10 hover:text-black",
                    openPanel === "profile" && "bg-white/10",
                  )}
                >
                  <CircleUserRound className="size-5" />
                </Button>

                {openPanel === "profile" && (
                  <ProfilePanel
                    user={user}
                    agencyName={userAgencyName}
                    roleLabel={roleLabel}
                    onNavigate={(href) => {
                      setOpenPanel(null);
                      router.push(href);
                    }}
                    onLogout={() => {
                      setOpenPanel(null);
                      logout.mutate();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleMockScan}
      />
    </header>
  );

  function updateUrlParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(nextUrl, { scroll: false });
  }
}

// ─── Notifications panel ──────────────────────────────────────────────────────

function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAll,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAll: () => void;
}) {
  return (
    <DropdownCard className="right-0 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-500">
              ยังไม่ได้อ่าน {unreadCount} รายการ
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAll}
            className="flex items-center gap-1 rounded-xl bg-[#0c6d66]/8 px-2.5 py-1.5 text-xs font-medium text-[#0c6d66] transition hover:bg-[#0c6d66]/15"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            อ่านทั้งหมด
          </button>
        )}
      </div>

      <div className="mx-4 h-px bg-slate-100" />

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BellOff className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              ไม่มีการแจ้งเตือน
            </p>
            <p className="text-xs text-slate-400">
              การแจ้งเตือนใหม่จะปรากฏที่นี่
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 px-2 py-1.5">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "relative flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50",
                )}
              >
                {!n.isRead && (
                  <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-[#0c6d66]" />
                )}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0c6d66]/10 text-[#0c6d66]">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pr-4">
                  <p
                    className={cn(
                      "text-sm leading-snug text-slate-900",
                      !n.isRead && "font-medium",
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DropdownCard>
  );
}

// ─── Profile panel ────────────────────────────────────────────────────────────

function ProfilePanel({
  user,
  agencyName,
  roleLabel,
  onNavigate,
  onLogout,
}: {
  user: { fullName: string; roles: string[] } | null;
  agencyName?: string | null;
  roleLabel: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <DropdownCard className="right-0 w-64">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 px-4 pt-5 pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#114e4b] text-lg font-bold text-black shadow-sm">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {user?.fullName || "ผู้เข้าใช้งาน"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{roleLabel}</p>
          {agencyName && (
            <p className="mt-0.5 text-xs text-[#0c6d66] font-medium">
              {agencyName}
            </p>
          )}
        </div>
      </div>

      <div className="mx-4 h-px bg-slate-100" />

      {/* Actions */}
      <div className="px-2 py-2 space-y-0.5">
        <ProfileAction
          icon={<User className="h-4 w-4" />}
          label="โปรไฟล์ของฉัน"
          onClick={() => onNavigate("/profile")}
        />
      </div>

      <div className="mx-4 h-px bg-slate-100" />

      {/* Logout */}
      <div className="px-2 py-2">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          ออกจากระบบ
        </button>
      </div>
    </DropdownCard>
  );
}

// ─── Shared dropdown shell ────────────────────────────────────────────────────

function DropdownCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-[calc(100%+10px)] z-50 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProfileAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      {label}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDetailPageTitle(pathname: string) {
  if (STANDALONE_PAGE_TITLES[pathname]) return STANDALONE_PAGE_TITLES[pathname];
  const matchedPrefix = Object.keys(DETAIL_PAGE_TITLES).find(
    (prefix) => pathname.startsWith(`${prefix}/`) && pathname !== prefix,
  );
  return matchedPrefix ? DETAIL_PAGE_TITLES[matchedPrefix] : null;
}

function parseCategories(value: string | null): BusinessCategory[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((category): category is BusinessCategory =>
      ["hotel", "hospital", "factory", "education"].includes(category),
    );
}
