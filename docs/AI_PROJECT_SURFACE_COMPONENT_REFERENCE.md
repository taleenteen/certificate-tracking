# AI Project Surface & Component Reference

วันที่จัดทำ: 2026-06-23  
วัตถุประสงค์: เอกสารนี้ใช้เป็น handoff ให้ AI agent หรือ developer คนถัดไปอ่านก่อนแก้ UI, route, component, feature, role, หรือ action flow ของโปรเจค E-License frontend

> เอกสารนี้อิงจากโครงสร้างไฟล์ปัจจุบันของโปรเจค ไม่ใช่ DBML v0.1 เดิม ให้ยึด `schema.prisma` และ naming ใหม่เป็นหลัก: `Business`, `InspectionTask`, `Zone`, `UserZone`

---

## 1. ภาพรวมระบบ

โปรเจคนี้เป็น Next.js App Router แบ่ง surface หลักเป็น 4 กลุ่ม:

1. Entry / Landing
   - path: `/`
   - mobile-first
   - ให้เลือกประเภทการเข้าใช้งาน 2 แบบเท่านั้น:
     - `บุคคลธรรมดา` → `/home?entry=public`
     - `เจ้าหน้าที่` → `/home?entry=officer`

2. Mobile-first App Portal
   - route group: `app/(app)`
   - ใช้กับ `Public / Business Owner` และ `Inspection Officer`
   - path หลัก: `/home`, `/businesses`, `/licenses`, `/inspection-tasks`, `/reports`, `/profile`, `/e-map`, `/license-search`
   - layout หลัก: `components/app-shell/AppShell`
   - navbar หลัก: `components/app-shell/AppNavbar`

3. Web-only Back-office
   - route group: `app/(back-office)`
   - ใช้กับ `SuperAdmin`, `Agency Admin`, `Zone Supervisor`
   - path หลัก:
     - `/super-admin/*`
     - `/agency-admin/*`
     - `/zone-supervisor`
   - ไม่ต้องบังคับ mobile-first เพราะเป็นหน้าจัดการข้อมูล/table-heavy บน desktop

4. Legacy Compatibility Redirect
   - route group: `app/(legacy)`
   - ไม่มี UI จริง
   - มีไว้ redirect path เก่าไป path ใหม่ เพื่อกัน link/bookmark เก่าพัง

---

## 2. Role และ route ownership

| Role | Surface หลัก | Route หลัก | UI Pattern | หมายเหตุ |
|---|---|---|---|---|
| SuperAdmin / ผู้พัฒนาระบบ | Back-office | `/super-admin/*` | Desktop table/dashboard | ดูภาพรวมระบบ, จัด agency/admin, logs, connection |
| Agency Admin / ผู้ดูแลหน่วยงาน | Back-office | `/agency-admin/*` | Desktop table/form | จัดการ inspection task และมอบหมายเจ้าหน้าที่ |
| Zone Supervisor / ผู้ควบคุมพื้นที่ | Back-office | `/zone-supervisor` | Desktop table/form | ตอนนี้เป็น placeholder redirect ไป `/agency-admin/inspections` |
| Inspection Officer / เจ้าหน้าที่ตรวจ | Mobile App เป็นหลัก | `/home?entry=officer`, `/reports`, `/inspection-tasks/[taskId]` | Mobile card + action เพิ่ม | ใช้ UI แนวเดียวกับประชาชน แต่มี action ตรวจ/อัปเดตเพิ่ม |
| Public / Business Owner / ประชาชน / ผู้ประกอบการ | Mobile App | `/home?entry=public`, `/businesses`, `/licenses`, `/profile` | Mobile card | เจ้าของนิติบุคคลใช้ context ของ business/juristic |

ข้อกำหนดสำคัญ:

- `AuthProviderLink` ใช้สำหรับเชื่อมข้อมูล identity จากทางรัฐ เช่น ชื่อ, เลขบัตร, email, phone และสร้าง session เท่านั้น
- ระบบยืนยันว่า “คนนี้เป็นเจ้าหน้าที่จริงไหม” ต้องเป็น officer credential/card verification แยกต่างหาก ไม่ควรลบแนวคิดนี้ออกจากระบบ
- ห้ามเก็บ `activeJuristicId` ใน `localStorage`
- ถ้าต้องจำ context นิติบุคคล/business ฝั่ง client ให้ใช้ `sessionStorage` เพื่อแยก context ราย tab
- URL ควรสะท้อน context เมื่อเป็นไปได้ เช่น `/businesses/[businessId]/licenses`
- Backend ต้อง re-validate ทุก request ที่ทำแทนนิติบุคคลกับ `JuristicMember` เสมอ ห้ามเชื่อ frontend

---

## 3. Route map แบบละเอียด

### 3.1 Entry route

#### `/`

ไฟล์:

- `app/page.tsx`

ทำหน้าที่:

- เป็น landing page แรกของระบบ
- แสดงตัวเลือกการเข้าใช้งาน 2 แบบเท่านั้น
- mobile-first card layout

ปุ่ม/ลิงก์:

| Label | Type | Target | Action |
|---|---|---|---|
| บุคคลธรรมดา | `Link` card | `/home?entry=public` | เข้า mobile app ใน public mode |
| เจ้าหน้าที่ | `Link` card | `/home?entry=officer` | เข้า mobile app ใน officer entry mode |

ข้อควรระวัง:

- อย่าเพิ่ม role หลังบ้านบน landing นี้ ถ้าเป็น admin/back-office ควรเข้าผ่าน path เฉพาะหรือ login flow เฉพาะ
- landing ต้องไม่กลายเป็น dashboard

---

### 3.2 Mobile App route group: `app/(app)`

#### `app/(app)/layout.tsx`

ทำหน้าที่:

- ครอบ mobile app ทุกหน้า
- ใช้ `BackOfficeAuthGuard`
- ใช้ `AppShell`

ผลต่อ UI:

- ทุกหน้าใน group นี้จะได้ mobile shell และ navbar ตาม logic ของ `AppNavbar`

ข้อควรระวัง:

- แม้ชื่อ guard เป็น `BackOfficeAuthGuard` แต่ถูกใช้ใน app layout ด้วย ให้ตรวจ logic ก่อนแก้ชื่อ/แยก guard
- ถ้าจะทำ guard แยก ควรแยกเป็น `AppAuthGuard` และ `BackOfficeAuthGuard` ให้ชัด

---

#### `/home`

ไฟล์:

- `app/(app)/home/page.tsx`
- `components/app/home/home-dashboard.tsx`

ทำหน้าที่:

- Dashboard หลักของ mobile app
- แสดงสรุปใบอนุญาต, feature shortcut, card สำคัญ, trend/summary
- รองรับทั้ง public/business owner และ officer entry

ปุ่ม/ลิงก์/action สำคัญ:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Search card | ค้นหาใบอนุญาต | ไป `/license-search` |
| QR button | scan QR | เปิด `QrScannerDialog` |
| QR mock scan | mock license id | verify/fallback แล้ว `router.push('/licenses/[id]?hideVerify=true')` |
| Shortcut | ใบอนุญาตของฉัน | ไป `/licenses` |
| Shortcut | E-map | ไป `/e-map` |
| Shortcut | สถานประกอบการ/นิติบุคคล | ไป `/businesses` |
| Reports section | รายงานทั้งหมด | ไป `/reports` |
| Trend filter | range selector | เปลี่ยนช่วง trend ใน state ของหน้า |

API/hooks ที่ใช้:

- `useDashboard`
- `useLicenses`
- `http.get('my/licenses?mode=personal')` เป็น fallback ในบาง flow

ข้อควรระวัง:

- ถ้าเพิ่ม feature สำหรับ officer ให้เพิ่มเป็น action condition ตาม role ไม่ใช่แยก card ใหม่จน UI ประชาชนกับเจ้าหน้าที่แตกคนละ pattern
- QR flow ต้องไม่ bypass backend verification

---

#### `/businesses`

ไฟล์:

- `app/(app)/businesses/page.tsx`
- `components/app/businesses/businesses-page.tsx`
- `components/app/businesses/business-filter-panel.tsx`
- `constants/mock-businesses.ts`

ทำหน้าที่:

- แสดงรายการ `Business`
- รองรับ search/filter จาก query string
- ใช้ card pattern เดียวกับงานตรวจ/สถานประกอบการ

Query ที่เกี่ยวข้อง:

- `q`
- `categories`
- `region`

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Search ใน navbar | input | update query `q` ผ่าน `router.replace` |
| Filter ใน navbar | filter button | เปิด `BusinessFilterPanel` |
| Filter panel | รีเซ็ต/ล้างตัวกรอง | reset draft filter |
| Filter panel | ใช้ตัวกรอง | apply filter แล้ว update query |
| Business card | ดูรายละเอียด | ไป `/businesses/[businessId]` |
| Business card | นำทาง | เปิด Google Maps directions ถ้ามี lat/lng; fallback ไป `/e-map` |

API/hooks:

- `useBusinesses(query, hasFilters)`
- fallback/mock: `MOCK_BUSINESSES`

ข้อควรระวัง:

- ห้ามใช้คำว่า establishment ใน route ใหม่
- path canonical คือ `/businesses`
- ถ้าทำ juristic context switching ให้สะท้อน business id ใน URL เท่าที่ทำได้

---

#### `/businesses/[businessId]`

ไฟล์:

- `app/(app)/businesses/[businessId]/page.tsx`
- `components/app/businesses/business-detail-page.tsx`

ทำหน้าที่:

- แสดงรายละเอียด Business
- แสดงข้อมูลสถานประกอบการ, ใบอนุญาตที่เกี่ยวข้อง, เจ้าของกิจการ, navigation footer

ส่วนประกอบในหน้า:

| Section | ข้อมูล |
|---|---|
| ข้อมูลสถานประกอบการ | ชื่อ business, address, สถานะ |
| ข้อมูลใบอนุญาต | รายการเอกสาร/ใบอนุญาต ใช้ `ListItemCard` |
| ข้อมูลเจ้าของกิจการ | phone/email |
| Footer/action | ใช้ `NavigationFooter` |

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Action |
|---|---|
| Back button จาก navbar | `router.back()` |
| Footer navigation | ปัจจุบันบาง action ยังเป็น placeholder/log; ก่อนใช้งานจริงต้องผูก route/action ให้ชัด |
| License item | ใช้ list card pattern; ถ้าเพิ่ม navigation ควรไป `/licenses/[id]` หรือ `/businesses/[businessId]/licenses` ตาม context |

API/hooks:

- `useBusiness(businessId)`
- fallback/mock: `MOCK_BUSINESSES`

---

#### `/businesses/[businessId]/licenses`

ไฟล์:

- `app/(app)/businesses/[businessId]/licenses/page.tsx`

ทำหน้าที่:

- compatibility/context route สำหรับรายการใบอนุญาตของ business
- redirect ไป `/licenses?businessId=[businessId]`

ข้อควรระวัง:

- Route นี้มีความหมายทาง context ชัดกว่า `/licenses` เฉย ๆ
- ถ้าในอนาคตทำหน้า list แยกตาม business จริง ควรคง URL นี้เป็น canonical สำหรับ juristic/business licenses

---

#### `/licenses`

ไฟล์:

- `app/(app)/licenses/page.tsx`
- `components/app/licenses/license-list-page.tsx`
- `components/app/licenses/license-certificate-card.tsx`
- `components/app/licenses/license-data.ts`

ทำหน้าที่:

- แสดงรายการใบอนุญาตของผู้ใช้หรือ business context
- มี tabs/status grouping
- ใช้ `LicenseCertificateCard` เป็น card หลัก

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Dev seed block | seed/create mock license | เรียก `useDevSeedLicense` เฉพาะ dev/helper flow |
| Status tabs | tab trigger | เปลี่ยนรายการใบอนุญาตตาม status |
| License card | copy | copy เลข/ข้อมูลใบอนุญาตลง clipboard |
| License card | ดูรายละเอียด | ไป `item.detailsHref` ปกติคือ `/licenses/[id]` |

API/hooks:

- `useLicenses`
- `useDevSeedLicense`

ข้อควรระวัง:

- ถ้ามี `businessId` query ต้อง ensure backend ตรวจสิทธิ `JuristicMember`
- ถ้าเพิ่ม action สำหรับ officer ให้ใช้ conditional rendering ตาม role ไม่ควรเปลี่ยน card base ของ public

---

#### `/licenses/[id]`

ไฟล์:

- `app/(app)/licenses/[id]/page.tsx`
- `components/app/licenses/license-detail-page.tsx`
- `components/app/licenses/license-preview.tsx`

ทำหน้าที่:

- แสดงรายละเอียดใบอนุญาต
- แสดง preview/metadata/contact/status/action
- เพิ่ม action ของเจ้าหน้าที่ได้เมื่อ `isStaff` เป็นจริง

Query ที่เกี่ยวข้อง:

- `hideVerify=true` ใช้ซ่อน/ข้ามบาง verify UI หลัง scan/redirect

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Copy button | copy license info | copy ข้อมูลใบอนุญาต |
| Upload control | เลือกไฟล์ | trigger hidden file input |
| Save status | บันทึกสถานะ | เรียก status update handler |
| Phone link | โทร | `tel:[phoneNumber]` |
| Email link | email | `mailto:[email]` |
| Inspection action | ไปงานตรวจ | `/inspection-tasks/[taskId-or-license-id]` |
| Back button จาก navbar | ย้อนกลับ | `router.back()` |

API/hooks:

- `useLicense(id)`
- `useIsStaff`
- status/update hook ตาม implementation ปัจจุบัน

ข้อควรระวัง:

- หน้า detail เป็นจุดร่วมของ public และ officer ต้องแยก action ด้วย permission ไม่ใช่แยก route โดยไม่จำเป็น
- ถ้า officer action เปลี่ยนสถานะใบอนุญาต ต้อง revalidate backend permission

---

#### `/license-search`

ไฟล์:

- `app/(app)/license-search/page.tsx`
- `components/app/licenses/license-search-page.tsx`
- `components/app/licenses/license-certificate-card.tsx`

ทำหน้าที่:

- หน้า search ใบอนุญาต
- ใช้ร่วมกับ search/scan pattern ใน navbar/home

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Action |
|---|---|
| Search input จาก navbar | update query `q` |
| Scan button จาก navbar | เปิด `QrScannerDialog` |
| Result card | ไป `/licenses/[id]` |
| Copy ใน card | copy ข้อมูลใบอนุญาต |

API/hooks:

- `useLicenses`

---

#### `/expired-licenses`

ไฟล์:

- `app/(app)/expired-licenses/page.tsx`
- ใช้ `LicenseListPageView`

ทำหน้าที่:

- แสดงเฉพาะใบอนุญาตหมดอายุ
- ใช้ card/list pattern เดียวกับ `/licenses`

ปุ่ม/ลิงก์/action:

- เหมือน `LicenseListPageView`
- card detail ไป `/licenses/[id]`

---

#### `/reports`

ไฟล์:

- `app/(app)/reports/page.tsx`
- `components/app/inspection-tasks/reports-page.tsx`
- `components/shared/inspection-task-card.tsx`

ทำหน้าที่:

- แสดงรายการ `InspectionTask` ของเจ้าหน้าที่/ผู้ใช้ที่เกี่ยวข้อง
- เป็นหน้า list ก่อนเข้า task detail

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Retry/loading error | ลองใหม่ | refetch task |
| Task card | ดูรายละเอียด | `/inspection-tasks/[taskId]` |
| Task card | นำทาง/secondary | ตาม `secondaryAction` ที่ส่งเข้า card |
| Pagination prev | ก่อนหน้า | update query page |
| Pagination number | เลขหน้า | update query page |
| Pagination next | ถัดไป | update query page |

API/hooks:

- `useInspectionTasks`

ข้อควรระวัง:

- route data model คือ `InspectionTask` ไม่ใช่ `work_orders`
- รายการนี้ควรรองรับ officer mode เป็นหลัก

---

#### `/inspection-tasks`

ไฟล์:

- `app/(app)/inspection-tasks/page.tsx`

ทำหน้าที่:

- redirect ไป `/reports`
- ไม่มี UI จริง

เหตุผล:

- `/reports` เป็นหน้า list ที่ user-facing ตอนนี้
- `/inspection-tasks/[taskId]` ยังเป็น canonical detail path

---

#### `/inspection-tasks/[taskId]`

ไฟล์:

- `app/(app)/inspection-tasks/[taskId]/page.tsx`
- `components/app/inspection-tasks/inspection-task-detail-page.tsx`

ทำหน้าที่:

- หน้า detail/action ของงานตรวจ
- ใช้กับเจ้าหน้าที่ตรวจเป็นหลัก
- รองรับ note, evidence/image, status update, submit/report flow ตาม implementation hook

ปุ่ม/ลิงก์/action ใน `app/(app)/inspection-tasks/[taskId]/page.tsx`:

| จุดในหน้า | Action |
|---|---|
| Back top | `router.back()` |
| Upload evidence | เปิด file input |
| Remove uploaded image | ลบ image จาก local state |
| Cancel/back footer | `router.back()` |
| Save | update status/note แล้ว `router.push('/licenses/[licenseId]')` |

ปุ่ม/ลิงก์/action ใน `components/app/inspection-tasks/inspection-task-detail-page.tsx`:

| Action | Hook ที่เกี่ยวข้อง |
|---|---|
| Start task | `useStartTask` |
| Save/update report | `useUpdateReport` |
| Submit report | `useSubmitReport` |
| Upload evidence | `useUploadEvidence` |
| Delete evidence | `useDeleteEvidence` |

API/hooks:

- `useInspectionTask`
- `useStartTask`
- `useUpdateReport`
- `useSubmitReport`
- `useUploadEvidence`
- `useDeleteEvidence`
- ใน route page ปัจจุบันยังมีบางส่วนใช้ `useLicense` / `useUpdateLicenseStatus` เนื่องจาก legacy transition

ข้อควรระวัง:

- ถ้าปรับต่อ ควรลด dependency กับ `License` ในหน้า task detail ให้เหลือ `InspectionTask` เป็นหลัก
- Action ทุกอย่างต้องตรวจ role officer ฝั่ง backend

---

#### `/e-map`

ไฟล์:

- `app/(app)/e-map/page.tsx`
- `components/app/map/e-map-page.tsx`

ทำหน้าที่:

- หน้าแผนที่ mobile-first สำหรับดูตำแหน่ง business/pin/license-related document
- ใช้ dynamic import เพื่อลด SSR issue กับ map library

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Pin select | กด pin/card | set selected pin |
| Close detail | ปิด panel | clear selected pin |
| Document link | ดูรายละเอียดเอกสาร | `document.detailsHref` |
| Direction | นำทาง | Google Maps directions |
| Business/detail | ดูรายละเอียด | `pin.detailsHref` ปกติ `/businesses/[id]` |

API/hooks:

- `useBusinessesMap`

ข้อควรระวัง:

- อย่าสับสนกับ `/map` ซึ่งเป็น legacy/standalone map route คนละชุด component
- ถ้า map feature ใช้ข้อมูล zone/pin จริง ต้อง sync กับ `Zone` และ map services

---

#### `/profile`

ไฟล์:

- `app/(app)/profile/page.tsx`

ทำหน้าที่:

- แสดงข้อมูล profile ผู้ใช้
- แสดงข้อมูล personal และ juristic/business context เมื่อมี
- มี action logout/change password

ปุ่ม/ลิงก์/action:

| จุดในหน้า | Label/Control | Target/Action |
|---|---|---|
| Error state | reload | `window.location.reload()` |
| Back | ย้อนกลับ | `router.back()` |
| Change password | เปลี่ยนรหัสผ่าน | `/auth/change-password` |
| Logout | ออกจากระบบ | เรียก logout แล้วไป `/auth/login` |

API/hooks:

- `useMyProfile`
- `useBusiness(activeJuristicId)`
- auth store/session hook

ข้อควรระวัง:

- active juristic/business context ห้ามใช้ `localStorage`
- ถ้ามี mode switch ควรใช้ `sessionStorage` + URL context + backend validation

---

### 3.3 Back-office route group: `app/(back-office)`

#### `app/(back-office)/layout.tsx`

ทำหน้าที่:

- ครอบ back-office ทุกหน้า
- ใช้ desktop-first layout/background
- ใช้ auth guard

---

#### `/agency-admin`

ไฟล์:

- `app/(back-office)/agency-admin/page.tsx`

ทำหน้าที่:

- redirect ไป `/agency-admin/inspections`

---

#### `/agency-admin/inspections`

ไฟล์:

- `app/(back-office)/agency-admin/layout.tsx`
- `app/(back-office)/agency-admin/inspections/page.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/admin/admin-header.tsx`
- `components/admin/inspections-page.tsx`
- `components/admin/inspection-form-modal.tsx`

ทำหน้าที่:

- หน้าจัดการ inspection task สำหรับ agency admin
- เห็น table/list ของงานตรวจ
- สร้างงานตรวจ
- มอบหมายเจ้าหน้าที่

ปุ่ม/ลิงก์/action:

| Component | Control | Action |
|---|---|---|
| `AdminSidebar` | `/agency-admin/inspections` | navigate ไปหน้าจัดการงานตรวจ |
| `AdminSidebar` | menu อื่น ๆ | ปัจจุบัน disabled/placeholder |
| `AdminHeader` | menu button | เปิด/ปิด sidebar mobile/tablet |
| `AdminHeader` | profile dropdown | เปิดเมนูผู้ใช้ |
| `AdminHeader` | logout | logout |
| `InspectionsPage` | ลองใหม่ | `refetch()` |
| `InspectionsPage` | สร้างงานตรวจ | เปิด `InspectionFormModal` |
| `InspectionsPage` | มอบหมาย/เปลี่ยนเจ้าหน้าที่ | set assigning task แล้วเปิด modal |
| `InspectionFormModal` | ปิด/cancel | close modal |
| `InspectionFormModal` | เลือก license/business | set selected license |
| `InspectionFormModal` | เลือก officer | set selected officer |
| `InspectionFormModal` | ก่อนหน้า/ถัดไป | wizard step navigation |
| `InspectionFormModal` | submit | create task / assign task |

API/hooks:

- `useInspectionTasks`
- `useUsers({ role: 'officer' })`
- `useAdminBusinesses`
- `useCreateTask`
- `useAssignTask`

ข้อควรระวัง:

- Route นี้เป็น back-office ไม่ใช่ mobile app
- ถ้าเพิ่ม feature สำหรับ Zone Supervisor ควรตัดสินใจว่าจะ reuse page นี้หรือแยก `/zone-supervisor/*`

---

#### `/zone-supervisor`

ไฟล์:

- `app/(back-office)/zone-supervisor/page.tsx`

ทำหน้าที่:

- ปัจจุบัน redirect ไป `/agency-admin/inspections`
- เป็น placeholder ของ role Zone Supervisor

ข้อควรระวัง:

- ถ้าจะ implement จริงควรสร้าง route group หรือ page ของ supervisor แยก เพื่อไม่ให้ permission ปนกับ agency admin

---

#### `/super-admin`

ไฟล์:

- `app/(back-office)/super-admin/page.tsx`

ทำหน้าที่:

- redirect ไป `/super-admin/dashboard`

---

#### `/super-admin/dashboard`

ไฟล์:

- `app/(back-office)/super-admin/layout.tsx`
- `app/(back-office)/super-admin/dashboard/page.tsx`
- `components/super-admin/super-admin-sidebar.tsx`
- `components/super-admin/super-admin-header.tsx`
- `components/super-admin/stat-card.tsx`
- `components/super-admin/agency-summary-table.tsx`
- `components/super-admin/system-alert-list.tsx`
- `components/super-admin/trend-chart.tsx`

ทำหน้าที่:

- Dashboard ภาพรวมระบบสำหรับ SuperAdmin
- แสดง stat, agency summary, alert, trend

ปุ่ม/ลิงก์/action:

| Component | Control | Action |
|---|---|---|
| `SuperAdminSidebar` | Dashboard | `/super-admin/dashboard` |
| `SuperAdminSidebar` | Admin Accounts | `/super-admin/admin-accounts` |
| `SuperAdminSidebar` | Agencies | `/super-admin/agencies` |
| `SuperAdminSidebar` | Connections | `/super-admin/connections` |
| `SuperAdminSidebar` | Audit Logs | `/super-admin/audit-logs` |
| `SuperAdminHeader` | menu button | เปิด/ปิด sidebar |
| `SuperAdminHeader` | profile dropdown | เปิดเมนูผู้ใช้ |
| `SuperAdminHeader` | logout | logout |
| Dashboard page | retry | `refetch()` dashboard |
| `AgencySummaryTable` | retry | `refetch()` agency data |

API/hooks:

- `useAdminDashboard`
- `useAgencies`

---

#### `/super-admin/admin-accounts`

ไฟล์:

- `app/(back-office)/super-admin/admin-accounts/page.tsx`
- `components/super-admin/admin-accounts-table.tsx`
- `components/super-admin/admin-form-modal.tsx`

ทำหน้าที่:

- จัดการบัญชี admin
- สร้าง/แก้ไข admin user

ปุ่ม/ลิงก์/action:

| Component | Control | Action |
|---|---|---|
| `AdminAccountsTable` | ลองใหม่ | `refetch()` |
| `AdminAccountsTable` | เพิ่มบัญชี Admin | เปิด `AdminFormModal` create mode |
| `AdminAccountsTable` | แก้ไข row | เปิด `AdminFormModal` edit mode |
| `AdminFormModal` | show/hide password | toggle password visibility |
| `AdminFormModal` | cancel | close modal |
| `AdminFormModal` | save | submit create/update user |

API/hooks:

- `useUsers`
- `useAgencies`
- create/update user mutation ตาม hook ที่ใช้อยู่

---

#### `/super-admin/agencies`

ไฟล์:

- `app/(back-office)/super-admin/agencies/page.tsx`
- `components/super-admin/master-data-table.tsx`
- `components/super-admin/master-data-modal.tsx`

ทำหน้าที่:

- จัดการ master data เช่น agency, zone, license type หรือ data category ที่ table รองรับ

ปุ่ม/ลิงก์/action:

| Component | Control | Action |
|---|---|---|
| `MasterDataTable` | tab | เปลี่ยน active dataset |
| `MasterDataTable` | เพิ่มข้อมูล | เปิด `MasterDataModal` create mode |
| `MasterDataTable` | ลองใหม่ | refetch |
| `MasterDataTable` | แก้ไข row | เปิด modal edit mode |
| `MasterDataModal` | cancel | close modal |
| `MasterDataModal` | save | submit create/update master data |

ข้อควรระวัง:

- คำว่า scope_nodes เดิมถูกแทนด้วย `Zone` / `UserZone`
- ถ้าทำ zone management ให้ยึด `/admin/zones` หรือ route ใหม่ที่สอดคล้อง ไม่ใช่ scope_nodes

---

#### `/super-admin/connections`

ไฟล์:

- `app/(back-office)/super-admin/connections/page.tsx`
- `components/super-admin/connections-dashboard.tsx`

ทำหน้าที่:

- Dashboard การเชื่อมต่อ external/integration
- มี action trigger DIW import/sync

ปุ่ม/ลิงก์/action:

| Control | Action |
|---|---|
| tab | เปลี่ยน connection category |
| trigger DIW | เรียก sync/import DIW |

API/hooks:

- `useSync`

ข้อควรระวัง:

- Integration action มักมี side effect ต้องแสดง loading/error ชัดเจน
- ถ้าต่อ API จริงควรมี audit log

---

#### `/super-admin/audit-logs`

ไฟล์:

- `app/(back-office)/super-admin/audit-logs/page.tsx`
- `components/super-admin/audit-logs-table.tsx`

ทำหน้าที่:

- แสดง audit logs
- filter/search/export log

ปุ่ม/ลิงก์/action:

| Control | Action |
|---|---|
| retry | `refetch()` |
| export csv | `exportAuditLogsCsv(filters)` |
| filter controls | update filters |

API/hooks:

- `useAuditLogs`
- `exportAuditLogsCsv`

---

### 3.4 Auth/dev routes

#### `/auth/login`

ไฟล์:

- `app/auth/login/page.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/RegisterForm.tsx`

ทำหน้าที่:

- login/register UI
- รองรับ public/officer/admin login modes ตาม implementation

ปุ่ม/ลิงก์/action:

| Component | Control | Action |
|---|---|---|
| `app/auth/login/page.tsx` | login tab | set mode login |
| `app/auth/login/page.tsx` | register tab | set mode register |
| `LoginForm` | show/hide password | toggle password visibility |
| `LoginForm` | admin mode | switch admin/public login mode |
| `LoginForm` | Tang Rat login placeholder | ปัจจุบันมี code/comment placeholder |
| `LoginForm` | submit | login mutation |
| `RegisterForm` | show/hide password | toggle password visibility |
| `RegisterForm` | submit | register mutation |
| `RegisterForm` | toggle login/register | switch form |

ข้อควรระวัง:

- Tang Rat เป็น auth provider/link source ไม่ใช่ officer credential verification
- หลังได้ข้อมูลจาก Tang Rat backend ต้องสร้าง session และ map user อย่างปลอดภัย

---

#### `/auth/change-password`

ไฟล์:

- `app/auth/change-password/page.tsx`

ทำหน้าที่:

- เปลี่ยนรหัสผ่าน
- ถ้าไม่มี temp token จะ redirect `/auth/login`

ปุ่ม/action:

- submit change password
- redirect เมื่อ token ไม่ถูกต้อง/หมดอายุ

---

#### `/dev-login`

ไฟล์:

- `app/dev-login/page.tsx`

ทำหน้าที่:

- development-only helper login
- มีปุ่ม mock login หลาย role/provider

ปุ่ม/action:

| Label/Mode | Action |
|---|---|
| tang-rat mock public owner | login ด้วย mock token public owner |
| tang-rat mock officer | login ด้วย mock token officer |
| password public-owner | login ด้วย username/password mock |
| password officer-login | login ด้วย username/password mock |
| self admin | login admin mock |

ข้อควรระวัง:

- ห้าม expose หน้า dev login ใน production โดยไม่มี guard/environment check

---

### 3.5 Legacy redirects

ไฟล์ใน `app/(legacy)` ไม่มี UI จริง ใช้ redirect เท่านั้น:

| Path เก่า | Path ใหม่ |
|---|---|
| `/dashboard` | `/super-admin/dashboard` |
| `/admin-accounts` | `/super-admin/admin-accounts` |
| `/agencies` | `/super-admin/agencies` |
| `/audit-logs` | `/super-admin/audit-logs` |
| `/connections` | `/super-admin/connections` |
| `/admin/inspections` | `/agency-admin/inspections` |
| `/establishment` | `/businesses` |
| `/establishment/[slug]` | `/businesses/[slug]` |
| `/my-licenses` | `/licenses` |
| `/my-licenses/[slug]` | `/licenses/[slug]` |
| `/my-licenses/[slug]/inspection` | `/inspection-tasks/[slug]` |

ข้อควรระวัง:

- ถ้าแน่ใจว่าไม่มี external link/bookmark แล้วค่อยพิจารณาลบ legacy route
- ก่อนลบต้องตรวจ `rg` references ทั้ง codebase และเอกสาร

---

## 4. Component map

### 4.1 App shell components

#### `components/app-shell/app-shell.tsx`

ทำหน้าที่:

- mobile-first shell wrapper
- ใส่ `AppNavbar`
- ให้ content ทุกหน้าใน mobile app อยู่ในกรอบ layout เดียวกัน

ใช้ใน:

- `app/(app)/layout.tsx`

---

#### `components/app-shell/app-navbar.tsx`

ทำหน้าที่:

- navbar หลักของ mobile app
- detect pathname เพื่อเลือก mode:
  - search page
  - detail page
  - standalone title page
- จัดการ search query, filter, QR scanner, notification panel, profile panel

Path config สำคัญ:

| Config | Path | Behavior |
|---|---|---|
| `SEARCH_PAGE_CONFIG` | `/e-map` | แสดง search/filter |
| `SEARCH_PAGE_CONFIG` | `/businesses` | แสดง search/filter |
| `SEARCH_PAGE_CONFIG` | `/reports` | แสดง search/filter |
| `SEARCH_PAGE_CONFIG` | `/license-search` | แสดง search/scan |
| `DETAIL_PAGE_TITLES` | `/businesses` | title รายละเอียดสถานประกอบการ |
| `DETAIL_PAGE_TITLES` | `/licenses` | title รายละเอียดใบอนุญาต |
| `STANDALONE_PAGE_TITLES` | `/licenses` | title ใบอนุญาตของฉัน |
| `STANDALONE_PAGE_TITLES` | `/expired-licenses` | title ใบอนุญาตหมดอายุ |

ปุ่ม/action:

| Control | Action |
|---|---|
| Back button | `router.back()` |
| Search input | update URL query `q` ผ่าน `router.replace(nextUrl, { scroll: false })` |
| Filter button | toggle `BusinessFilterPanel` |
| Scan button | เปิด `QrScannerDialog` |
| Notification button | toggle notification panel |
| Mark all notifications read | `http.patch('notifications/read-all', {})` |
| Profile button | toggle profile panel |
| Profile panel: profile | `router.push('/profile')` |
| Profile panel: logout | `useLogout` |
| QR scan mock/scan | verify `licenses/[id]/qr-verify`, fallback `my/licenses`, แล้ว push `/licenses/[id]?hideVerify=true` |

API:

- `http.get('my/notifications')`
- `http.patch('notifications/read-all', {})`

ข้อควรระวัง:

- Search state sync ผ่าน URL ไม่ใช่ local-only state
- ถ้าเพิ่ม page ที่ต้องมี search/filter ต้องเพิ่ม config ที่นี่ด้วย

---

#### `components/app-shell/qr-scanner-dialog.tsx`

ทำหน้าที่:

- dialog กลางสำหรับ QR scan
- มี mock scan action สำหรับ dev/demo

ปุ่ม/action:

| Control | Action |
|---|---|
| Close | ปิด dialog |
| Mock scan | `onScanMock('5621-17/965')` |

ใช้ใน:

- `AppNavbar`
- `HomeDashboard`

---

### 4.2 Shared components

#### `components/shared/inspection-task-card.tsx`

ทำหน้าที่:

- card กลางสำหรับ item ที่เป็น business/task/report style
- รองรับ primary/secondary action เป็น link หรือ onClick

Props/action:

| Prop | ความหมาย |
|---|---|
| `primaryAction` | action หลัก เช่น ดูรายละเอียด |
| `secondaryAction` | action รอง เช่น นำทาง |
| `href` ใน action | render เป็น `Link` |
| `onClick` ใน action | render เป็น button action |

ใช้ใน:

- businesses list
- reports/inspection task list

---

#### `components/shared/ListItemCard.tsx`

ทำหน้าที่:

- list/card row แบบคลิกได้
- ใช้แสดงเอกสาร/ใบอนุญาต/ข้อมูลย่อย

Action:

- `onClick` ถ้าส่งมา

---

#### `components/shared/NavigationFooter.tsx`

ทำหน้าที่:

- footer action bar
- รองรับ action เป็น `href` หรือ `onClick`

ใช้ใน:

- business detail และหน้าที่ต้องมี footer action pattern

---

#### `components/shared/SectionCard.tsx`

ทำหน้าที่:

- wrapper card สำหรับแบ่ง section

ใช้ใน:

- หลายหน้า detail/list ที่ต้องการ section layout consistent

---

#### `components/shared/StatusBadge.tsx`

ทำหน้าที่:

- แสดงสถานะด้วย badge
- ใช้ใน card/list/detail

---

### 4.3 App feature components

#### Businesses

| File | ทำหน้าที่ | ใช้ใน |
|---|---|---|
| `components/app/businesses/businesses-page.tsx` | list/search/filter business | `/businesses` |
| `components/app/businesses/business-detail-page.tsx` | business detail | `/businesses/[businessId]` |
| `components/app/businesses/business-filter-panel.tsx` | panel ตัวกรอง business | navbar + `/businesses` |

Best practice:

- `Business` คือ naming ปัจจุบัน
- ห้ามกลับไปใช้ `establishment` ใน route ใหม่
- ถ้าจำ context ต้องใช้ sessionStorage/URL ไม่ใช้ localStorage

---

#### Licenses

| File | ทำหน้าที่ | ใช้ใน |
|---|---|---|
| `components/app/licenses/license-list-page.tsx` | list + tab/filter ใบอนุญาต | `/licenses`, `/expired-licenses` |
| `components/app/licenses/license-certificate-card.tsx` | card ใบอนุญาต | license list/search |
| `components/app/licenses/license-detail-page.tsx` | detail/action ใบอนุญาต | `/licenses/[id]` |
| `components/app/licenses/license-preview.tsx` | preview เอกสาร/ใบอนุญาต | license detail |
| `components/app/licenses/license-search-page.tsx` | search result UI | `/license-search` |
| `components/app/licenses/license-data.ts` | mapper/static helper data | license components |

Action สำคัญ:

- copy license data
- go detail
- upload evidence/file ใน detail
- save status ใน detail
- phone/email links
- go inspection task

---

#### Inspection tasks

| File | ทำหน้าที่ | ใช้ใน |
|---|---|---|
| `components/app/inspection-tasks/reports-page.tsx` | list/pagination ของ inspection tasks | `/reports` |
| `components/app/inspection-tasks/inspection-task-detail-page.tsx` | task detail/report/evidence action | `/inspection-tasks/[taskId]` |

Best practice:

- ใช้ naming `InspectionTask`
- อย่าเรียก `work_order` ใน UI/route ใหม่
- Officer action ต้องมี backend permission check

---

#### Home

| File | ทำหน้าที่ | ใช้ใน |
|---|---|---|
| `components/app/home/home-dashboard.tsx` | mobile dashboard + shortcuts + QR flow | `/home` |

Feature ที่ประกอบ:

- license summary
- license search shortcut
- QR verification flow
- business shortcut
- e-map shortcut
- reports shortcut
- trend/range selection

---

#### Map

| File | ทำหน้าที่ | ใช้ใน |
|---|---|---|
| `components/app/map/e-map-page.tsx` | mobile e-map, pin list/detail/direction | `/e-map` |

Action สำคัญ:

- select pin
- open document detail
- open Google Maps direction
- open business detail

---

### 4.4 Back-office components

#### Admin / Agency Admin

| File | ทำหน้าที่ |
|---|---|
| `components/admin/admin-sidebar.tsx` | sidebar ของ agency admin |
| `components/admin/admin-header.tsx` | header/profile/logout ของ agency admin |
| `components/admin/inspections-page.tsx` | table/list งานตรวจ + create/assign actions |
| `components/admin/inspection-form-modal.tsx` | wizard modal สำหรับสร้าง/มอบหมายงานตรวจ |

Action สำคัญ:

- เปิด/ปิด sidebar
- logout
- refetch task
- create inspection task
- assign officer
- wizard next/back/submit

---

#### Super Admin

| File | ทำหน้าที่ |
|---|---|
| `components/super-admin/super-admin-sidebar.tsx` | sidebar navigation ของ super admin |
| `components/super-admin/super-admin-header.tsx` | header/profile/logout |
| `components/super-admin/stat-card.tsx` | summary metric card |
| `components/super-admin/agency-summary-table.tsx` | agency summary table |
| `components/super-admin/system-alert-list.tsx` | system alert list |
| `components/super-admin/trend-chart.tsx` | trend chart |
| `components/super-admin/admin-accounts-table.tsx` | admin account management table |
| `components/super-admin/admin-form-modal.tsx` | create/edit admin modal |
| `components/super-admin/master-data-table.tsx` | master data table/tabs |
| `components/super-admin/master-data-modal.tsx` | master data create/edit modal |
| `components/super-admin/connections-dashboard.tsx` | integration/connection dashboard |
| `components/super-admin/audit-logs-table.tsx` | audit log filter/table/export |

Navigation:

- `/super-admin/dashboard`
- `/super-admin/admin-accounts`
- `/super-admin/agencies`
- `/super-admin/connections`
- `/super-admin/audit-logs`

---

### 4.5 Map management components

กลุ่ม `components/map/*` เป็น map management/legacy/admin-style map components ที่ยังอยู่ในโปรเจค:

| File | ทำหน้าที่โดยประมาณ |
|---|---|
| `SmartCityMap.tsx` | map container/interaction หลักของชุด map เดิม |
| `MapContainer.tsx` | wrapper map |
| `MapTools.tsx` | controls เช่น zoom/reset/draw/tool mode |
| `ExistingPinsLayer.tsx` | render pins เดิมบน map |
| `MapPopup.tsx` | popup detail บน map |
| `FilterPins.tsx` | filter pins |
| `PinManageCard.tsx` | จัดการ pin, fly-to, edit, delete |
| `ZoneCreateCard.tsx` | สร้าง zone/parcel |
| `ZoneEditCard.tsx` | แก้ไข zone |
| `ZoneManageCard.tsx` | จัดการ zone list/edit/delete |
| `ZoneInfoPanel.tsx` | แสดงข้อมูล zone และ parcel |
| `ParcelCreateModal.tsx` | modal สร้าง parcel |
| `pin-form/*` | form และ hook สำหรับสร้าง/แก้ไข pin |

ข้อควรระวัง:

- กลุ่มนี้มี lint debt อยู่หลายจุด เช่น `any`, hook deps, fast refresh warning
- ก่อนย้ายเข้า route ใหม่ ต้อง audit state/store/API ให้ชัด
- อย่าสับสนกับ mobile `/e-map` ที่ใช้ `components/app/map/e-map-page.tsx`

---

### 4.6 UI primitives

กลุ่ม `components/ui/*` เป็น primitive components เช่น:

- `button`
- `card`
- `dialog`
- `dropdown-menu`
- `input`
- `select`
- `table`
- `tabs`
- `sheet`
- `sidebar`
- `tooltip`
- `pagination`
- `alert-dialog`

กฎการใช้:

- ใช้ primitive เหล่านี้ก่อนสร้าง component ใหม่
- ถ้า pattern ซ้ำใน feature ให้ห่อเป็น shared/feature component ไม่ควรใส่ business logic ใน primitive
- อย่าแก้ primitive เพื่อเคสเดียวจนกระทบทั้งระบบ

---

## 5. Hooks / data access map

| Hook | ใช้สำหรับ | ใช้ใน surface |
|---|---|---|
| `useAuth` | login/logout/session auth | auth/app/back-office |
| `useSession` | session state | auth guards/profile |
| `useMyProfile` | profile ปัจจุบัน | `/profile` |
| `useDashboard` | dashboard data | `/home` |
| `useBusinesses` | list/search business | `/businesses`, admin modal |
| `useBusiness` | business detail | `/businesses/[businessId]`, profile context |
| `useBusinessesMap` | business/pin data for e-map | `/e-map` |
| `useLicenses` | list licenses | `/licenses`, `/license-search`, `/home` |
| `useLicense` | license detail | `/licenses/[id]`, legacy inspection detail |
| `useInspectionTasks` | list inspection tasks | `/reports`, `/agency-admin/inspections` |
| `useInspectionTask` | inspection task detail | `/inspection-tasks/[taskId]` |
| `useIsStaff` | role/staff detection | license detail/officer action |
| `useUsers` | user/admin/officer list | admin/super-admin |
| `useAgencies` | agency list | super-admin |
| `useAdminDashboard` | super-admin dashboard | `/super-admin/dashboard` |
| `useAuditLogs` | audit logs | `/super-admin/audit-logs` |
| `useSync` | integration sync | `/super-admin/connections` |
| `useZones` | zone data | map/admin future |
| `useLicenseTypes` | license type data | master data/license forms |
| `useExistingPins` | map pins | map management |

Service files:

| File | ทำหน้าที่ |
|---|---|
| `services/pin.service.ts` | pin API/service |
| `services/zone.service.ts` | zone API/service |
| `services/parcel.service.ts` | parcel API/service |
| `services/floor.service.ts` | floor API/service |
| `services/mock-map-data.ts` | mock map data |

Stores:

| File | ทำหน้าที่ |
|---|---|
| `stores/auth.ts` | auth/session state |
| `stores/useMapStore.ts` | map UI/domain state |

Types:

| File | ทำหน้าที่ |
|---|---|
| `types/api.ts` | API/domain TS types |
| `types/api.d.ts` | declaration types |
| `types/map.ts` | map domain types |
| `types/mapbox-gl-draw.d.ts` | mapbox draw declarations |

---

## 6. API proxy

#### `app/api/[...path]/route.ts`

ทำหน้าที่:

- proxy route สำหรับ API calls ผ่าน Next.js
- ช่วยรวม path handling ระหว่าง frontend กับ backend

ข้อควรระวัง:

- ไม่ควรใส่ authorization business rule หลักไว้แค่ frontend
- Backend ต้อง validate permission ตาม role/context เสมอ
- Request ที่ทำแทน business/juristic ต้องเช็ค membership ฝั่ง backend

---

## 7. Naming rules ที่ต้องยึดในงานถัดไป

| ห้ามใช้/ของเก่า | ให้ใช้ |
|---|---|
| `establishment`, `/establishment` | `Business`, `/businesses` |
| `work_orders` | `InspectionTask`, `/inspection-tasks` |
| `scope_nodes` | `Zone`, `UserZone` |
| `officer_digital_cards` เป็น AuthProviderLink | แยกเป็น officer credential/card verification feature |
| `complaints` | ยังไม่อยู่ใน current Prisma; ห้ามใส่ใน plan/code ถ้าไม่ได้รับ requirement |

---

## 8. วิธีเพิ่มหน้าใหม่ให้สอดคล้องกับโครงสร้างนี้

1. ระบุ surface ก่อน:
   - mobile app → `app/(app)`
   - back-office → `app/(back-office)`
   - compatibility redirect → `app/(legacy)`

2. ระบุ role owner:
   - public/business owner
   - inspection officer
   - agency admin
   - zone supervisor
   - super admin

3. เลือก component location:
   - feature mobile → `components/app/[feature]`
   - shared card/layout → `components/shared`
   - back-office admin → `components/admin`
   - super-admin → `components/super-admin`
   - primitive → `components/ui`

4. เพิ่ม route/action map ในเอกสารนี้ด้วยทุกครั้ง:
   - path
   - component
   - ปุ่ม
   - link target
   - mutation/API side effect
   - role/permission

5. ถ้ามี route ใหม่ที่ต้องมี search/filter/scan/navbar title:
   - update `components/app-shell/app-navbar.tsx`
   - เพิ่ม config ให้ถูก section

6. ถ้าเป็น business/juristic context:
   - ใช้ `sessionStorage` ไม่ใช้ `localStorage`
   - สะท้อน context ใน URL ถ้าเป็นไปได้
   - backend revalidate กับ `JuristicMember`

---

## 9. Known gaps / จุดที่ AI ถัดไปควรระวัง

1. Full lint ยังมี technical debt ในหลายไฟล์ โดยเฉพาะกลุ่ม map/admin/super-admin
   - `explicit any`
   - hook dependency warning
   - fast refresh warning
   - script `require` warning

2. หน้า `/inspection-tasks/[taskId]` ยังมีบาง logic ผูกกับ license legacy
   - ควรค่อย ๆ migrate ให้ data source หลักเป็น `InspectionTask`

3. `zone-supervisor` ยังเป็น placeholder
   - ถ้าจะ implement จริงต้องออก permission และ route แยก

4. `officer credential/card verification` ยังต้องนิยาม model/API/UI ให้ชัด
   - อย่าสับสนกับ `AuthProviderLink`

5. `app/map/page.tsx` และ `components/map/*` เป็น map stack แยกจาก mobile `/e-map`
   - ก่อนรวม/ลบต้องตรวจ usage และ route owner

---

## 10. Quick checklist ก่อน AI agent แก้ feature

- [ ] อ่านเอกสารนี้ก่อน
- [ ] ตรวจ route group ว่าเป็น mobile app หรือ back-office
- [ ] ใช้ naming ใหม่: `Business`, `InspectionTask`, `Zone`
- [ ] ตรวจ role ที่มีสิทธิใช้ action
- [ ] ถ้าเพิ่มปุ่ม ให้ระบุ `href` หรือ `onClick` ให้ชัด
- [ ] ถ้าเพิ่ม mutation ให้มี loading/error/success state
- [ ] ถ้าเกี่ยวกับ juristic/business context ห้ามใช้ `localStorage`
- [ ] ถ้าเพิ่มหน้า search/filter ต้อง update `AppNavbar`
- [ ] ถ้าแก้ path ต้อง update legacy redirect หรือเอกสารนี้
- [ ] รัน typecheck/lint ที่เหมาะสมกับ scope

