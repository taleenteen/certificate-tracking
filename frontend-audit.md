# Frontend Integration Audit — Certificate Tracking System

> **Generated:** 2026-06-16
> **Project:** Next.js Frontend (certificate-tracking)
> **Master Contract:** `IMPLEMENTATION_GUIDE_1.md` / `openapi.json`
> **AI Plan:** `FRONTEND_GUIDE_AI.md`

## 1. Route Audit Table

| Route | File path | Status | Components | Mock data location | API endpoints (from openapi.json) | Juristic-context aware? | Auth tier | Gaps/notes |
|---|---|---|---|---|---|---|---|---|
| `/` | `app/page.tsx` | `done` | N/A | N/A | N/A | N | `none` | Redirects to `/home` |
| `/home` | `app/(back-office)/home/page.tsx` | `wireframe-only` | `HomeDashboard`, `MiniTile` | Inline in `home-dashboard.tsx` | `GET /dashboard/inspector`, `GET /dashboard/supervisor` | Y | `public` / `inspector` / `supervisor` | Dashboards differ significantly by role. |
| `/search` | `app/(back-office)/license-search/page.tsx` | `wireframe-only` | `LicenseSearchPage` | `license-data.ts` | `GET /licenses/{id}/qr-verify` | N | `public` | Mainly for QR scan/public search. |
| `/establishment` | `app/(back-office)/establishment/page.tsx` | `wireframe-only` | `EstablishmentPage` | `license-data.ts` | `GET /businesses` | Y | `public` / `inspector` | Lists businesses in context. |
| `/establishment/[slug]` | `app/(back-office)/establishment/[slug]/page.tsx` | `wireframe-only` | `EstablishmentDetailPage` | `license-data.ts` | `GET /businesses/{id}` | N | `public` | Business details. |
| `/my-licenses` | `app/(back-office)/my-licenses/page.tsx` | `wireframe-only` | `LicenseListPageView` | `mockMyLicenses` in file | `GET /my/licenses` | Y | `public` | Key user/tenant page. |
| `/my-licenses/[slug]` | `app/(back-office)/my-licenses/[slug]/page.tsx` | `wireframe-only` | `LicenseDetailPage` | `mockLicenseDetails` in `license-data.ts` | `GET /licenses/{id}` | N | `public` | License detail + RNG4 logic. |
| `/my-licenses/[slug]/inspection` | `app/(back-office)/my-licenses/[slug]/inspection/page.tsx` | `wireframe-only` | `LicenseInspectionPage` | `license-data.ts` | `GET /inspection-tasks/{id}`, `PUT /inspection-reports/{id}` | N | `inspector` | Report entry. |
| `/map` | `app/map/page.tsx` | `wireframe-only` | `MapContainer`, `ExistingPinsLayer` | `mock-map-data.ts` | `GET /businesses/map` | N | `public` | Mapbox visualization. |
| `/e-map` | `app/(back-office)/e-map/page.tsx` | `wireframe-only` | `EMapPage` | `mock-map-data.ts` | `GET /businesses/map` | N | `public` | Wrapper for `/map`. |
| `/expired-licenses` | `app/(back-office)/expired-licenses/page.tsx` | `wireframe-only` | N/A | N/A | `GET /my/licenses?status=EXPIRED` | Y | `public` | Filtered list. |
| `/reports` | `app/(back-office)/reports/page.tsx` | `wireframe-only` | `ReportsPage` | N/A | `GET /inspection-tasks` | Y | `inspector` / `supervisor` | Inspection history. |

## 2. Missing Pages (D5/D6/D7)

These pages do not exist in the current wireframe and must be created from scratch in **Phase D**:

| Missing Page | Path | API endpoints | Auth tier | Notes |
|---|---|---|---|---|
| **Login / Register** | `/auth/login`, `/auth/register` | `POST /auth/login`, `POST /auth/register`, `POST /auth/self` | `none` | Multi-path auth. |
| **Identity/Profile** | `/profile` | `GET/PATCH /my/profile`, `POST/DELETE /my/identities/tang-rat` | `public` | D5 Identity binding. |
| **Juristic Portal** | `/juristic` | `GET /juristic`, `POST /auth/context` | `public` | D6 Company switcher. |
| **Join Requests** | `/juristic-requests` | `GET /juristic-requests/companies`, `POST /juristic-requests` | `public` | D7 Self-service. |
| **Review Queue** | `/supervisor/reports/[id]/review` | `PATCH /inspection-reports/{id}/approve` | `supervisor` | Supervisor approval surface. |

## 3. Conventions & State

- **Styling:** Tailwind CSS is used extensively. `globals.css` contains many custom utility classes.
- **Components:** Feature-specific components are in `components/back-office`. UI primitives are in `components/ui` (shadcn).
- **Icons:** Lucide-react.
- **State Management:** Currently using local `useState` in many places. I will extend this with **Zustand** for Auth/Juristic context as per `FRONTEND_GUIDE_AI.md`.
- **Data Fetching:** Currently using hardcoded `mock*` objects. I will transition to **React Query** (`@tanstack/react-query`).

## 4. Gaps & TODOs

- `// TODO(api-gap):` Audit timeline items in `license-data.ts` — the backend `InspectionReport` findings might need mapping to this timeline structure.
- `// TODO(api-gap):` The `/home` dashboard stats (Normal, Expiring, etc.) need to be derived from `GET /dashboard/*` responses which are not yet fully wired to aggregate exactly like the UI.
- `// TODO(api-gap):` QR verification flow in `/search` needs a real scanner integration (e.g. `html5-qrcode`).
