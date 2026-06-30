"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronRight, FileEdit, FileSearch, X } from "lucide-react";

interface ComplaintsSheetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintsSheetOverlay({
  isOpen,
  onClose,
}: ComplaintsSheetOverlayProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close sheet on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleItemClick = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            ref={overlayRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[32px] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] px-6 pb-12 pt-3 flex justify-center text-left"
          >
            <div className="w-full max-w-[430px]">
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-200/80 rounded-full mx-auto mb-5" />

              {/* Close Button top-right (standard web accessibility option) */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header Titles */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-[#145b57]">
                  แจ้งเรื่องร้องเรียน
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  เลือกบริการที่ต้องการเกี่ยวกับการร้องเรียน
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Button 1: แจ้งเรื่องร้องเรียน */}
                <button
                  type="button"
                  onClick={() => handleItemClick("/complaints/new")}
                  className="w-full text-left bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.015)] hover:bg-slate-50/50 hover:border-slate-200/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Circle Icon green backdrop */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f2ef] text-[#145b57] shrink-0">
                      <FileEdit className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">
                        แจ้งเรื่องร้องเรียน
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        แจ้งปัญหาหรือเบาะแสเกี่ยวกับสถานประกอบการ
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Button 2: ติดตามสถานะเรื่องร้องเรียน */}
                <button
                  type="button"
                  onClick={() => handleItemClick("/complaints/track")}
                  className="w-full text-left bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.015)] hover:bg-slate-50/50 hover:border-slate-200/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Circle Icon green backdrop */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f2ef] text-[#145b57] shrink-0">
                      <FileSearch className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">
                        ติดตามสถานะเรื่องร้องเรียน
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        ตรวจสอบความคืบหน้าเรื่องที่เคยแจ้ง
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
