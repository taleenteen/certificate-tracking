"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SystemUserSummary } from "@/hooks/useUsers";
import { useAgencies } from "@/hooks/useAgencies";

type AccessRole = "public" | "officer" | "admin";

interface UserAccessModalProps {
  open: boolean;
  user: SystemUserSummary | null;
  officerShortcut?: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { roles: AccessRole[]; agencyId?: string }) => void;
}

export function UserAccessModal({
  open,
  user,
  officerShortcut = false,
  isSaving,
  onOpenChange,
  onSave,
}: UserAccessModalProps) {
  const { data: agencies = [] } = useAgencies();
  const [role, setRole] = React.useState<AccessRole>("public");
  const [agencyId, setAgencyId] = React.useState("");

  React.useEffect(() => {
    if (!open || !user) return;
    const currentRole: AccessRole = officerShortcut
      ? "officer"
      : user.roles.includes("admin")
      ? "admin"
      : user.roles.includes("officer")
        ? "officer"
        : "public";
    setRole(currentRole);
    setAgencyId(user.agencyId ?? "");
  }, [officerShortcut, open, user]);

  const requiresAgency = role === "officer";
  const canSave = !requiresAgency || !!agencyId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-square-hard border border-gray-200 bg-background p-6">
        <DialogHeader>
          <DialogTitle className="text-left text-[18px] font-bold text-main">
            {officerShortcut ? "แต่งตั้งเจ้าหน้าที่" : "กำหนดสิทธิ์ผู้ใช้งาน"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-square border border-gray-200 bg-fuji-light/30 px-3 py-2">
            <p className="text-[13px] font-semibold text-main">
              {user?.fullName}
            </p>
            <p className="text-[12px] text-placeholder">
              {user?.email ?? user?.username ?? "ไม่มีข้อมูลติดต่อ"}
            </p>
          </div>

          {officerShortcut ? null : (
            <div className="space-y-1.5">
              <Label
                htmlFor="access-role"
                className="text-[13px] font-semibold text-main"
              >
                สิทธิ์ในระบบ
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as AccessRole)}
              >
                <SelectTrigger id="access-role" className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">ผู้ใช้งานทั่วไป</SelectItem>
                  <SelectItem value="officer">เจ้าหน้าที่</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="access-agency"
              className="text-[13px] font-semibold text-main"
            >
              หน่วยงาน{" "}
              {requiresAgency && (
                <span className="text-semantic-critical">*</span>
              )}
            </Label>
            <Select
              value={agencyId}
              onValueChange={setAgencyId}
              disabled={!requiresAgency}
            >
              <SelectTrigger id="access-agency" className="border-gray-200">
                <SelectValue placeholder="เลือกหน่วยงาน" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.code} - {agency.nameTh}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {requiresAgency && !agencyId && (
              <p className="text-[11px] text-semantic-critical">
                เจ้าหน้าที่ต้องสังกัดหน่วยงาน
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-square"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!canSave || isSaving}
            onClick={() =>
              onSave({
                roles: [role],
                agencyId: requiresAgency ? agencyId : undefined,
              })
            }
            className="rounded-square bg-brand-primary text-white hover:bg-brand-primary/95"
          >
            {isSaving
              ? "กำลังบันทึก..."
              : officerShortcut
                ? "แต่งตั้งเจ้าหน้าที่"
                : "บันทึกสิทธิ์"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
