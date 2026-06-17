# Overview of Super Admin & Agency Admin Features

This document provides a comprehensive guide to the features, page functions, and mock data models built for the **Super Admin** and **Agency Admin** modules. It is designed to guide backend developers in transitioning the frontend from mock-data states to live API integrations.

---

## 1. Core Architecture: BFF & React Query

As defined in the project architecture guidelines:
* **No Direct Backend Calls**: All frontend components fetch data from the same-origin BFF proxy path `/api/*` via the browser HTTP client `@/lib/http`.
* **State Management**: React Query hooks in `hooks/` wrap these HTTP calls.
* **Transition Strategy**: To wire any page to the backend, delete the local mock logic in the hook and make a standard `http.get`, `http.post`, etc. request.

---

## 2. Super Admin Module

The Super Admin interface is a system-wide management console located in the `app/(super-admin)/` layout group. It provides system-wide monitoring, global agency management, and configuration.

### 2.1. Pages and Capabilities

| Route | Main Component | Purpose | Key Capabilities |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `SuperAdminDashboard` | System-wide statistics and system telemetry. | Displays total users, agencies, database status, API request volume graphs, and file storage usage. |
| `/admin-accounts` | [AdminAccountsTable](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/admin-accounts-table.tsx) | Global administrator account management. | Lists administrators; filters by agency and status; searches by name/email; opens the [AdminFormModal](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/admin-form-modal.tsx) to create or edit admin accounts. |
| `/agencies` | [MasterDataTable](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/master-data-table.tsx) | Configuration of master data schemas. | Tabbed system managing four datasets: **Agencies**, **Licenses**, **Locations**, and **Statuses**. Integrates search, pagination, and forms via [MasterDataModal](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/master-data-modal.tsx). |
| `/connections` | [ConnectionsDashboard](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/connections-dashboard.tsx) | External integrations and endpoint monitoring. | Monitors Tang Rat OAuth client alerts, manual batch DIW imports, cache servers, database tables, and maintenance timetables. |
| `/audit-logs` | [AuditLogsTable](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/audit-logs-table.tsx) | Immutable security audit trails. | Tabulated logs tracking administrative modifications across the platform, filterable by date, action type, and editor ID. |

---

## 3. Agency Admin Module

The Agency Admin ("ผู้ดูแลหน่วยงาน") module provides task assignment, scheduling, and officer supervision capabilities for individual government agencies.

### 3.1. Pages and Capabilities

| Route | Main Component | Purpose | Key Capabilities |
| :--- | :--- | :--- | :--- |
| `/admin/inspections` | [InspectionsPage](file:///Users/mac/Frontend/certificate-tracking/components/admin/inspections-page.tsx) | Inspection task assignment and workflow tracking. | Features a white-background left sidebar [AdminSidebar](file:///Users/mac/Frontend/certificate-tracking/components/admin/admin-sidebar.tsx) where only "งานตรวจสอบ" is active (disabled options represent future tabs). Features dynamic stats cards, date filters, task status badges, and details table. |

### 3.2. Actions & Modals
* **Create Task**: The "+ สร้างงานตรวจสอบใหม่" button displays the [InspectionFormModal](file:///Users/mac/Frontend/certificate-tracking/components/admin/inspection-form-modal.tsx) to log operator details, license ID, type, and scheduled date.
* **Assign Task / Edit**: Selecting a task ID or clicking "แก้ไข" / "มอบหมาย" prepopulates the form. Selecting an officer from the dropdown dynamically advances the task's state from `WAITING_ASSIGNMENT` to `ASSIGNED`.

---

## 4. Mock Data Models & Flexibility

All data rendered in both dashboards is currently mocked via structured constants. This data can be easily customized or substituted.

### 4.1. Inspection Tasks Model
Located in [mock-inspections.ts](file:///Users/mac/Frontend/certificate-tracking/constants/mock-inspections.ts):
```typescript
export interface Inspector {
  id: string;
  name: string;
}

export interface InspectionTask {
  id: string; // INS-XXXX
  licenseNo: string;
  licenseType: string;
  operatorName: string;
  assignee: Inspector | null;
  inspectionDate: string; // dd/mm/yyyy
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_ASSIGNMENT' | 'COMPLETED' | 'CANCELLED';
}
```
* **Flexibility**:
  - The status determines the color of badges in the table (`ASSIGNED` = blue, `IN_PROGRESS` = orange, `WAITING_ASSIGNMENT` = yellow, `COMPLETED` = green, `CANCELLED` = red).
  - Setting `assignee: null` displays the high-visibility red **"ยังไม่ได้มอบหมาย" (Unassigned)** warning.
  - Adding or removing items in `MOCK_INSPECTIONS` or `MOCK_OFFICERS` automatically updates the summary stats cards at the top of `/admin/inspections` dynamically.

### 4.2. Super Admin Mock Schema
Located inside the respective feature files or [SUPER_ADMIN_MOCKS_GUIDE.md](file:///Users/mac/Frontend/certificate-tracking/docs/SUPER_ADMIN_MOCKS_GUIDE.md):
- **Admin Accounts**: Extensible object schema managing full name, email, phone, `czpUserId`, associated agencies list, and status.
- **Master Data**: Supports nested configuration (e.g. associating license templates to their issuing agency, assigning region filters to specific office branches).
- **Endpoint Latencies & Logs**: Found in `API_LOGS_MOCK` under `/connections`, showcasing status codes (200, 401, 504) and response millisecond intervals.

---

## 5. Transition to Live Backend (Integration Guide)

To link these user interfaces with live backend APIs:
1. **Identify the Endpoint**: Refer to `openapi.json` for the exact route.
2. **Modify/Create React Query Hook**: For instance, in `hooks/useInspectionTasks.ts`:
   ```typescript
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { http } from '@/lib/http';
   import { useAuthStore } from '@/stores/auth';

   export function useInspectionTasks() {
     const agency = useAuthStore((s) => s.user?.agency);
     return useQuery({
       queryKey: ['inspection-tasks', agency],
       queryFn: () => http.get<InspectionTask[]>(`inspection-tasks?agency=${agency}`),
     });
   }
   ```
3. **Trigger Mutations**: Replace form dialog `onSave` logic with React Query `useMutation` triggers making `POST` or `PATCH` updates to the BFF proxy.
4. **Delete Mock Imports**: Delete local array imports and reference properties straight from the React Query `{ data }` stream.
