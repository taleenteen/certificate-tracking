import { z } from "zod";
import { PinCategory, PinType } from "@/types/api";

export const pinFormSchema = z
  .object({
    title: z.string().min(1, "กรุณาระบุชื่อหมุด").trim(),

    // Category & Type
    category: z.nativeEnum(PinCategory, {
      message: "กรุณาเลือกหมวดหมู่",
    }),
    type: z.nativeEnum(PinType).optional(), // Use with DEVICE mode
    subtype: z.string().optional(), // Use with INFO mode

    // Geometry data mapping
    locationType: z.enum(["pin", "area"]),
    points: z.array(z.any()).optional(),
    polygonGeometry: z.any().optional(),

    // Mapping relationships
    zoneId: z.string().optional(),
    parcelId: z.string().optional(),
    floorId: z.string().optional(),

    // Metadata
    isPublic: z.boolean(),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === PinCategory.DEVICE && !data.zoneId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาเลือกโซนก่อนสร้างหมุด",
        path: ["zoneId"], // Points the error to the zoneId field
      });
    }

    // 2. Geometry Requirement for LocationType Pin
    if (
      data.locationType === "pin" &&
      (!data.points || data.points.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาระบุตำแหน่งบนแผนที่",
        path: ["points"],
      });
    }

    // 3. Geometry Requirement for LocationType Area
    if (data.locationType === "area" && !data.polygonGeometry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาวาดพื้นที่บนแผนที่",
        path: ["polygonGeometry"],
      });
    }
  });

export type PinFormValues = z.infer<typeof pinFormSchema>;
