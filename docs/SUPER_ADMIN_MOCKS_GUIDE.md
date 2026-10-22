# Super Admin Module - Mock Data & Backend Integration Guide

This guide documents the file paths, line numbers, and schemas of the mock data used in the newly built Super Admin modules. It serves as an integration handbook for the backend engineering team to wire real REST APIs.

---

## 1. Admin Accounts Management (`/super-admin/admin-accounts`)

### Mock Data Details
- **Component File**: [admin-accounts-table.tsx](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/admin-accounts-table.tsx)
- **Code Reference**: Starting at Line 17 (`INITIAL_ADMINS` constant).
- **Data Schema**:
  ```typescript
  interface AdminAccount {
    id: string;          // Database ID
    fullName: string;    // First and last name (Thai)
    email: string;       // Corporate/government email
    phone: string;       // Contact phone number
    czpUserId: string;   // Unique citizen identifier from mToken
    agencies: string[];  // Multi-select list of active agencies (e.g. ['DIW', 'ACFS'])
    status: 'Active' | 'Inactive';
    createdAt: string;   // Created timestamp string (Thai format: dd/mm/yyyy Buddhist Era)
  }
  ```

### Backend APIs to Implement
1. **List Administrators**: `GET /api/super-admin/admins`
   - Should support query parameters for filtering: `search` (query string matching name/email/czp), `agency`, and `status`.
2. **Create Administrator**: `POST /api/super-admin/admins`
   - Request Body: `Omit<AdminAccount, 'id' | 'createdAt'>` (BFF will map `czpUserId` verified from mToken).
3. **Update Administrator**: `PUT /api/super-admin/admins/:id`
   - Request Body: Partial updates for properties (name, email, phone, active status, and agency associations).

---

## 2. Agencies & Master Data Management (`/super-admin/agencies`)

### Mock Data Details
- **Component File**: [master-data-table.tsx](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/master-data-table.tsx)
- **Code Reference**: Lines 9 to 38 (`INITIAL_AGENCIES`, `INITIAL_LICENSE_TYPES`, `INITIAL_LOCATIONS`, `INITIAL_STATUSES` arrays).
- **Data Categories**:

#### A. Agencies (หน่วยงาน)
- **Schema**:
  ```typescript
  interface Agency {
    id: string;
    agencyCode: string;   // Short agency identifier (e.g., 'DIW', 'FDA')
    name: string;         // Full agency name (Thai)
    licenseTypes: string[]; // Active license category codes managed (e.g., ['ร.ง.4'])
    adminCount: number;   // Number of administrative users assigned
  }
  ```
- **Backend API**: `GET /api/agencies`, `POST /api/agencies`, `PUT /api/agencies/:id`

#### B. License Types (ประเภทใบอนุญาต)
- **Schema**:
  ```typescript
  interface LicenseType {
    id: string;
    name: string;       // Name of license (e.g., 'ร.ง.4')
    code: string;       // Identifier code (e.g., 'RNG4')
    duration: string;   // Standard license validity duration (e.g., '5 ปี')
    agency: string;     // Responsible agency code
    law: string;        // Supporting legislation description
  }
  ```
- **Backend API**: `GET /api/license-types`, `POST /api/license-types`, `PUT /api/license-types/:id`

#### C. Provinces/Zones (จังหวัด/เขตพื้นที่)
- **Schema**:
  ```typescript
  interface LocationZone {
    id: string;
    code: string;       // Area code identifier (e.g., '10')
    province: string;   // Thai province name (e.g., 'กรุงเทพมหานคร')
    zone: string;       // Local sub-region name (e.g., 'กทม.')
    region: string;     // Wider geographic region (e.g., 'กลาง')
  }
  ```
- **Backend API**: `GET /api/locations`, `POST /api/locations`, `PUT /api/locations/:id`

#### D. Statuses & Actions (สถานะ & Next Action)
- **Schema**:
  ```typescript
  interface StatusAction {
    id: string;
    statusCode: string;  // Internal status code (e.g., 'PENDING', 'APPROVED')
    statusName: string;  // Display status name (Thai)
    description: string; // Explanatory text for the current status state
    nextAction: string;  // Prescribed next action for workflow progress
    color: 'success' | 'warning' | 'critical' | 'purple' | 'muted'; // Styling token
  }
  ```
- **Backend API**: `GET /api/statuses`, `POST /api/statuses`, `PUT /api/statuses/:id`

---

## 3. System Connections & Status (`/super-admin/connections`)

### Mock Data Details
- **Component File**: [connections-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/connections-dashboard.tsx)
- **Code Reference**: Lines 17 to 38 (`API_LOGS_MOCK`, `CHART_DATA_MOCK`).

### Backend APIs to Implement
1. **External API Connection Health**: `GET /api/system/connections`
   - Returns connectivity states, warning flags, key expiration timers.
2. **API Call Logs**: `GET /api/system/logs`
   - Returns a structured array representing incoming integration triggers.
3. **Daily Request Volumes Chart**: `GET /api/system/metrics/hourly`
   - Feeds hourly request counts to render bar graphs.
4. **Server Infrastructure Health**: `GET /api/system/health`
   - Reports uptime checks for Web servers, databases, caching, and storage.
5. **System Services Uptimes**: `GET /api/system/uptimes`
   - Overall monthly health percentages.
6. **Maintenance Timetable**: `GET /api/system/maintenance`
   - Future planned maintenance windows.

---

## 4. Audit Log Management (`/super-admin/audit-logs`)

### Mock Data Details
- **Component File**: [audit-logs-table.tsx](file:///Users/mac/Frontend/certificate-tracking/components/super-admin/audit-logs-table.tsx)
- **Code Reference**: Starting at Line 19 (`INITIAL_LOGS` constant).
- **Data Schema**:
  ```typescript
  interface AuditLogEntry {
    id: string;
    dateTime: string;    // Action timestamp (e.g. '15/06/2568 09:14')
    agency: string;      // Acted agency identifier (e.g. 'DIW')
    user: string;        // Name of user who performed action
    target: string;      // Affected object description (e.g. 'บัญชี Admin #12')
    action: string;      // Action type description (e.g. 'สร้างบัญชี')
    field: string;       // Property modified (e.g. 'status')
    oldVal: string;      // Value prior to action
    newVal: string;      // Value after action
  }
  ```

### Backend APIs to Implement
1. **List System Audit Logs**: `GET /api/super-admin/audit-logs`
   - Query Parameters: `agency`, `user` (search filter), `action` type, and modified `field`.
   - CSV Export Support: Provide a query endpoint that responds with a `text/csv` formatted payload representing the filtered log entries for spreadsheet downloading.
2. **Log Audit Event**: `POST /api/super-admin/audit-logs`
   - Triggered internally by BFF/API middleware on state-modifying actions (user updates, license actions, master scope edits).
