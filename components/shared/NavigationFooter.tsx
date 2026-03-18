// features/business-detail/components/NavigationFooter.tsx
import { Map } from "lucide-react";

type Props = {
  onNavigate?: () => void;
};

export function NavigationFooter({ onNavigate }: Props) {
  return (
    <div className=" bg-white border-t border-gray-100 p-4">
      <button
        onClick={onNavigate}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-gray-700 font-medium hover:bg-gray-200 transition"
      >
        <Map className="w-5 h-5" />
        นำทาง
      </button>
    </div>
  );
}
