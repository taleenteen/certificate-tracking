import { ApiClient } from "./api-client";
import { ApiPin, CreatePinDto, UpdatePinDto } from "@/types/api";

export interface PinFilterParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  take?: number;
  type?: string;
}

export const PinService = {
  getAll: async (params?: PinFilterParams) => {
    const query = new URLSearchParams();

    if (params?.minLat !== undefined)
      query.set("minLat", String(params.minLat));
    if (params?.maxLat !== undefined)
      query.set("maxLat", String(params.maxLat));
    if (params?.minLng !== undefined)
      query.set("minLng", String(params.minLng));
    if (params?.maxLng !== undefined)
      query.set("maxLng", String(params.maxLng));
    if (params?.type) query.set("type", params.type);

    // Default high limit to avoid pagination issues
    query.set("take", String(params?.take || 1000));

    const queryString = query.toString();
    const url = queryString ? `/pins?${queryString}` : "/pins";

    const response = await ApiClient.get<any>(url);
    return response.data || response;
  },

  getById: async (id: string) => {
    return ApiClient.get<ApiPin>(`/pins/${id}`);
  },

  create: async (data: CreatePinDto) => {
    return ApiClient.post<ApiPin>("/pins", data);
  },

  update: async (id: string, data: UpdatePinDto) => {
    return ApiClient.patch<ApiPin>(`/pins/${id}`, data);
  },

  delete: async (id: string) => {
    return ApiClient.delete<void>(`/pins/${id}`);
  },

  getCategories: async () => {
    const response = await ApiClient.get<any>("/pins/categories"); // Use 'any' to allow .data check
    return response.data || response;
  },
};
