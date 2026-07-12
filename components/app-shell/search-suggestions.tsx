"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Building2, Loader2, MapPin, Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useBusinessSearchSuggestions,
  type BusinessSummary,
} from "@/hooks/useBusinesses";
import { cn } from "@/lib/utils";

type SearchSuggestionsProps = {
  /** Current input value (not necessarily debounced). */
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (business: BusinessSummary) => void;
  /** Optional class for the anchor wrapper width. */
  className?: string;
  children: ReactNode;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Highlight match without breaking layout / overflowing the card. */
function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q || !text) return text;

  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[3px] bg-emerald-100/90 px-0.5 text-inherit [box-decoration-break:clone]">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function SearchSuggestions({
  value,
  open,
  onOpenChange,
  onSelect,
  className,
  children,
}: SearchSuggestionsProps) {
  const listId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(value.trim(), 300);
  const canSearch = debouncedQuery.length >= 1;
  const isDebouncing = value.trim() !== debouncedQuery;

  const { data, isFetching, isError } = useBusinessSearchSuggestions(
    debouncedQuery,
    { enabled: open && canSearch, limit: 8 },
  );

  const items = data?.data ?? [];
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(-1);
  }, [debouncedQuery, open]);

  const showPanel = open && value.trim().length >= 1;

  // Close dropdown on outside click
  useEffect(() => {
    if (!showPanel) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPanel, onOpenChange]);

  const emptyMessage = useMemo(() => {
    if (isError) return "โหลดผลค้นหาไม่สำเร็จ";
    if (!canSearch || isDebouncing) return null;
    if (isFetching && items.length === 0) return null;
    if (items.length === 0) return `ไม่พบ “${debouncedQuery}”`;
    return null;
  }, [
    isError,
    canSearch,
    isDebouncing,
    isFetching,
    items.length,
    debouncedQuery,
  ]);

  const handleSelect = (business: BusinessSummary) => {
    onSelect(business);
    onOpenChange(false);
  };

  const onKeyDownCapture = (event: React.KeyboardEvent) => {
    if (!showPanel) return;

    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) onOpenChange(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
      event.preventDefault();
      handleSelect(items[activeIndex]);
    }
  };

  return (
    <div
      ref={anchorRef}
      className={cn("relative w-full min-w-0", className)}
      onKeyDownCapture={onKeyDownCapture}
    >
      {children}

      {showPanel && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-2",
            "box-border overflow-hidden rounded-3xl border border-slate-100 bg-white pb-3",
            "text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.12)]",
          )}
        >
          {/* Header — roomy padding so query text ellipsizes before the edge */}
          <div className="flex min-w-0 items-center gap-2.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3 pr-5">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium leading-4 tracking-normal text-slate-500">
              ผลค้นหา
              {debouncedQuery ? (
                <>
                  {" "}
                  <span className="font-semibold text-slate-700">
                    “{debouncedQuery}”
                  </span>
                </>
              ) : null}
            </p>
            {(isFetching || isDebouncing) && (
              <Loader2
                className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400"
                aria-hidden
              />
            )}
          </div>

          {isFetching && items.length === 0 ? (
            <div className="space-y-1.5 px-4 pt-3 pb-1 pr-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl p-3 bg-white"
                >
                  <Skeleton className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    <Skeleton className="h-4 w-[70%] max-w-[12rem] rounded bg-slate-100" />
                    <Skeleton className="h-3 w-full rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : emptyMessage ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <Building2 className="h-5 w-5 text-slate-400" aria-hidden />
              </div>
              <p className="mx-auto max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-bold leading-5 text-slate-800">
                {emptyMessage}
              </p>
              <p className="mt-1.5 text-[12px] font-medium leading-4 text-slate-400">
                ลองพิมพ์ชื่อสถานประกอบการหรือที่อยู่
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[280px] w-full">
              <ul
                id={listId}
                role="listbox"
                aria-label="ผลการค้นหาสถานประกอบการ"
                className="space-y-1.5 px-4 pt-3 pb-1 pr-5"
              >
                {items.map((business, index) => {
                  const primaryType =
                    business.licenses[0]?.licenseType.nameTh ?? null;
                  const isActive = index === activeIndex;
                  const location = [business.address, business.province]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <li
                      key={business.id}
                      role="option"
                      aria-selected={isActive}
                      className="min-w-0"
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex w-full min-w-0 items-start gap-3 rounded-2xl p-3 text-left outline-none transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-[#114e4b]/30 focus-visible:ring-offset-1",
                          isActive
                            ? "bg-[#e7f2f1] text-[#0d3f3c]"
                            : "text-slate-900 hover:bg-slate-50",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(e) => {
                          // Prevent input blur before click registers
                          e.preventDefault();
                        }}
                        onClick={() => handleSelect(business)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isActive
                              ? "bg-[#114e4b]/15 text-[#114e4b]"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          <Building2 className="h-4 w-4" aria-hidden />
                        </span>

                        {/* Text column: min-w-0 + overflow so ellipsis appears before right padding */}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          {/* Title — single line with … */}
                          <span
                            className={cn(
                              "block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
                              "text-[14px] font-bold leading-5 tracking-tight",
                              isActive ? "text-[#0d3f3c]" : "text-slate-900",
                            )}
                            title={business.nameTh}
                          >
                            {highlightMatch(business.nameTh, debouncedQuery)}
                          </span>

                          {/* Address — 1 line with … (cleaner than wrapping into edge) */}
                          {location ? (
                            <span className="mt-1 flex min-w-0 items-center gap-1.5">
                              <MapPin
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden
                              />
                              <span
                                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-slate-400"
                                title={location}
                              >
                                {highlightMatch(location, debouncedQuery)}
                              </span>
                            </span>
                          ) : null}

                          {/* License type badge */}
                          {primaryType ? (
                            <span
                              className={cn(
                                "mt-2 inline-flex max-w-full min-w-0 items-center rounded-full px-2.5 py-0.5",
                                "text-[11px] font-semibold leading-4 tracking-normal",
                                isActive
                                  ? "bg-white/80 text-[#114e4b]"
                                  : "bg-slate-100 text-slate-600",
                              )}
                              title={primaryType}
                            >
                              <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                {primaryType}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
