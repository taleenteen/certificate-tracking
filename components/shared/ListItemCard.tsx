// components/common/ListItemCard.tsx
import { ChevronRight } from "lucide-react";
import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/components/shared/StatusBadge";

type Props = {
  title: string;
  status: StatusBadgeStatus;
  expireDate?: string;
  onClick?: () => void;
};

export function ListItemCard({ title, status, expireDate, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">{title}</p>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} />

          {expireDate && (
            <span className="text-xs text-gray-500">
              วันหมดอายุ : {expireDate}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );
}
