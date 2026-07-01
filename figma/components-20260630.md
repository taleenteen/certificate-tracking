# Components Export 2026-06-30

Source Figma file: https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-941  
Root node: `853:941` / `เจ้าหน้าที่ตรวจสอบ`

> Export note: Figma MCP metadata for the target node was available. Direct `use_figma` variable/component inspection hit the current Figma View-seat MCP rate limit, so this catalog focuses on reusable components visible in the targeted node metadata and maps them to existing frontend component boundaries where applicable.

## Context Split

- **Left / Officer context:** งานของเจ้าหน้าที่และ back-office/field officer เช่น ตรวจสอบใบอนุญาต, ค้นหาสถานประกอบการ, InspectionTask, officer identity verification.
- **Right / Citizen context:** งานประชาชนและผู้ประกอบการ เช่น ค้นหาใบอนุญาต, ดูสถานประกอบการ, ใบอนุญาตของฉัน, e-Map, verify officer.
- **Shared mobile shell:** หลาย screen ใช้ viewport mobile width `440px` และ shared shell patterns เช่น status bar, greeting header, search/scan entry, card list, bottom navigation.

## Reusable Components

### App Mobile Shell

- **Context:** Shared citizen/officer mobile portal
- **Description:** Mobile-first page shell with fixed-width app frame, status bar/header area, notification/profile actions, and content region.
- **Variants:** `citizen`, `officer`; with/without search bar; with/without bottom navigation.
- **Props/API:** `role`, `title`, `subtitle`, `actions`, `children`, `bottomNavItems`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-653
- **Current code mapping:** `components/app-shell/app-shell.tsx`, `components/app-shell/app-navbar.tsx`
- **Example usage:**

```tsx
<AppShell role="citizen" activeItem="home">
  <HomeDashboard />
</AppShell>
```

### Header Greeting Bar

- **Context:** Shared mobile portal
- **Description:** Greeting block showing user name and active user type, paired with notification and profile actions.
- **Variants:** `citizen` label `บุคคลธรรมดา`, officer/back-office role label, optional search action.
- **Props/API:** `displayName`, `roleLabel`, `notificationCount`, `onProfileClick`, `onNotificationClick`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-669
- **Current code mapping:** Header logic is currently embedded in `components/app/home/home-dashboard.tsx`; should be extracted if reused across pages.
- **Example usage:**

```tsx
<HeaderGreetingBar
  displayName="คุณสมชาย"
  roleLabel="บุคคลธรรมดา"
  onProfileClick={() => router.push("/profile")}
/>
```

### License Search Field

- **Context:** Shared, especially citizen/public search and officer lookup
- **Description:** Rounded search input with leading search icon and trailing QR scan/search action.
- **Variants:** empty state shows scan button; filled state shows search action; optional autocomplete.
- **Props/API:** `value`, `placeholder`, `onChange`, `onSubmit`, `onScanClick`, `suggestions`, `mode`.
- **Figma node links:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-700, https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23280
- **Current code mapping:** `components/app/licenses/license-search-page.tsx`, `components/shared/search-sheet-overlay.tsx`
- **Example usage:**

```tsx
<LicenseSearchField
  value={query}
  placeholder="ระบุเลขที่ใบอนุญาต หรือชื่อสถานประกอบการ"
  onSubmit={handleSearch}
  onScanClick={() => setScannerOpen(true)}
/>
```

### QR Scan Action

- **Context:** Shared citizen/officer
- **Description:** Action button for scanning QR codes, used for license verification and officer verification.
- **Variants:** icon-only, icon+text row, scanner dialog trigger.
- **Props/API:** `label`, `size`, `onClick`, `disabled`.
- **Figma node links:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-708, https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23349
- **Current code mapping:** `components/app-shell/qr-scanner-dialog.tsx`, `components/icons/AppIcons.tsx`
- **Example usage:**

```tsx
<Button variant="ghost" aria-label="Scan QR Code" onClick={openScanner}>
  <QrScannerIcon size={20} />
</Button>
```

### Hero / Informational Banner

- **Context:** Citizen home and search entry
- **Description:** Compact mobile banner with Thai headline, supporting copy, and right-side illustration.
- **Variants:** home license confidence banner, search landing banner.
- **Props/API:** `title`, `description`, `image`, `tone`, `action`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-710
- **Current code mapping:** `components/app/home/home-dashboard.tsx`
- **Example usage:**

```tsx
<InfoBanner
  title="ตรวจสอบใบอนุญาต ได้อย่างมั่นใจ"
  description="ค้นหาและดูสถานะใบอนุญาตของสถานประกอบการได้ง่ายและรวดเร็ว"
/>
```

### Service Shortcut Card

- **Context:** Citizen home
- **Description:** Tappable service tile with icon, title, and short count/description.
- **Variants:** `myLicenses`, `eMap`, `businesses`; active/disabled/loading.
- **Props/API:** `icon`, `title`, `description`, `count`, `href`, `disabled`.
- **Figma node links:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-785, https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-794, https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-808
- **Current code mapping:** home shortcuts are currently embedded in `components/app/home/home-dashboard.tsx`
- **Example usage:**

```tsx
<ServiceShortcutCard
  title="ใบอนุญาตของฉัน"
  count="4 รายการ"
  href="/licenses"
/>
```

### License Status Summary Card

- **Context:** Citizen home dashboard
- **Description:** Summary card showing license total and segmented status distribution.
- **Variants:** populated, empty, loading; status colors for active, expiring, expired, suspended.
- **Props/API:** `total`, `segments`, `href`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-836
- **Current code mapping:** `components/app/home/home-dashboard.tsx`
- **Example usage:**

```tsx
<LicenseStatusSummaryCard
  total={8}
  segments={[
    { label: "มีผลบังคับใช้", value: 2, tone: "success" },
    { label: "ใกล้หมดอายุ", value: 3, tone: "warning" },
  ]}
/>
```

### Business Search Empty State

- **Context:** Citizen business search
- **Description:** Centered empty/search prompt with illustration and guidance text.
- **Variants:** no query, no results, loading.
- **Props/API:** `title`, `description`, `image`, `action`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-1480
- **Current code mapping:** `components/app/businesses/businesses-page.tsx`
- **Example usage:**

```tsx
<SearchEmptyState
  title="ค้นหาสถานประกอบการ"
  description="พิมพ์ชื่อสถานประกอบการ หรือใช้ตัวกรองเพื่อค้นหา"
/>
```

### Business Result Card

- **Context:** Citizen business search and officer lookup
- **Description:** Business list item with business name, business type, license count, and two actions.
- **Variants:** citizen result card, officer inspection target card; with/without navigation action.
- **Props/API:** `companyName`, `businessType`, `licenseCount`, `detailsHref`, `primaryAction`, `secondaryAction`.
- **Figma node link:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-1522
- **Current code mapping:** `components/shared/inspection-task-card.tsx`, `components/app/businesses/businesses-page.tsx`
- **Example usage:**

```tsx
<InspectionTaskCard
  companyName="บริษัท ศิริพัฒนา โฮเทล แอนด์ เซอร์วิส จำกัด"
  businessType="โรงงาน"
  certificateNumber={2}
  primaryAction={{ label: "ดูรายละเอียด", href: "/businesses/123", variant: "primary" }}
  secondaryAction={{ label: "นำทาง", href: "/e-map", variant: "secondary" }}
/>
```

### Search Form Card

- **Context:** Officer/public lookup flow
- **Description:** Card containing business-name search, license-number input, search button, and QR scan row.
- **Variants:** default empty, business prefilled, license error/placeholder, combined business+license input.
- **Props/API:** `businessName`, `licenseNumber`, `onBusinessChange`, `onLicenseChange`, `onSearch`, `onScan`.
- **Figma node links:** https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23280, https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23737
- **Current code mapping:** `components/shared/search-sheet-overlay.tsx`, `components/app/licenses/license-search-page.tsx`
- **Example usage:**

```tsx
<SearchFormCard
  businessName={businessName}
  licenseNumber={licenseNumber}
  onSearch={submitLookup}
  onScan={openScanner}
/>
```

### Officer Verification Result Card

- **Context:** Citizen verifies arriving officer
- **Description:** Public-safe verification card showing authorized or not-found state with officer detail rows.
- **Variants:** success/authorized, failed/not found.
- **Props/API:** `state`, `officerName`, `agency`, `zone`, `verifiedAt`, `permissions`, `onConfirm`, `onRetryScan`.
- **Figma node link:** Root context includes officer-card verification requirement; code-aligned route is `/verify-officer`.
- **Current code mapping:** `components/app/officer/verify-officer-content.tsx`
- **Example usage:**

```tsx
<OfficerVerificationResultCard
  state="success"
  officerName="นายสมชาย ใจดี"
  agency="กรมโรงงานอุตสาหกรรม"
  zone="จังหวัดสมุทรปราการ"
/>
```

## Implementation Notes For AI Agents

- Prefer existing shadcn/Radix primitives in `components/ui/` for Button, Card, Dialog, Sheet, Input, Tabs, Badge, Skeleton.
- Route citizen/business flows through `/home`, `/businesses`, `/businesses/[businessId]`, `/businesses/[businessId]/licenses`, `/license-search`, `/licenses`, `/verify-officer`.
- Route officer work through `/inspection-tasks`, `/profile`, and web-only back-office routes as appropriate.
- Keep active juristic/business context in `sessionStorage` only when needed; reflect business context in URLs.
- Treat frontend role split as UX only. Backend/BFF must revalidate authorization.
