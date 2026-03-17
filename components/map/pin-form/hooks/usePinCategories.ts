import { useState, useEffect } from "react";
import { PinService } from "@/services/pin.service";
import { PinCategory } from "@/types/api";

export interface CategoryOption {
  category: PinCategory;
  icon: string;
  color: string;
  nameTh?: string;
  subtypes: {
    code: string;
    name: string;
    nameTh: string;
    icon: string;
    color: string;
  }[];
}

export const CATEGORY_NAMES: Record<string, string> = {
  INFRASTRUCTURE: "โครงสร้างพื้นฐาน",
  ASSET: "ครุภัณฑ์",
  SERVICE_POINT: "จุดบริการ",
  ENVIRONMENT: "สิ่งแวดล้อม",
  RISK: "ความเสี่ยง",
  ECONOMY: "เศรษฐกิจ",
  MANAGEMENT: "ข้อมูลบริหาร",
  DEVICE: "อุปกรณ์ IoT",
  SOLAR: "โซล่าเซลล์",
  MONITORING: "ระบบ Monitoring",
};

export function usePinCategories(pinMode: "device" | "info") {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await PinService.getCategories();
        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          // Fallback if API fails
          setCategories([
            {
              category: PinCategory.INFRASTRUCTURE,
              icon: "building",
              color: "#8B4513",
              subtypes: [
                {
                  code: "municipal_office",
                  name: "Municipal Office",
                  nameTh: "สำนักงานเทศบาล",
                  icon: "building",
                  color: "#8B4513",
                },
                {
                  code: "school",
                  name: "School",
                  nameTh: "โรงเรียนสังกัด",
                  icon: "school",
                  color: "#8B4513",
                },
              ],
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (pinMode === "info") {
      fetchCategories();
    }
  }, [pinMode]);

  return { categories, isLoadingCategories: isLoading };
}
