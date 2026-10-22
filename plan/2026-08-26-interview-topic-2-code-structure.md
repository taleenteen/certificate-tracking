# Interview Topic 2: Code Structure / Architecture Overview

## Status

Implemented

## Owner

Candidate (user) — เอกสารนี้เป็นสคริปต์สัมภาษณ์ ไม่ใช่การเปลี่ยนโค้ดระบบ

## Dates

- Created: 2026-08-26
- Last updated: 2026-08-26

## Objective

สรุปโครงสร้างโค้ดและสถาปัตยกรรมของแพลตฟอร์ม E-License จากโค้ดจริงทั้ง frontend (`certificate-tracking`) และ backend (`certificate-tracking-backend`) เป็นภาษาไทย สำหรับ Topic 2 ของการสัมภาษณ์งาน

## Context and constraints

- ผู้สัมภาษณ์ขอ overview ของ code structure/architecture ที่ทำในช่วง 3 ปี รวม project scale และ tech stack
- ต้องอิงของจริงใน repo ไม่แต่งสเกลหรือเทคโนโลยีที่ไม่มีในระบบ
- ใช้ภาษาไทยเป็นหลัก คงศัพท์เทคนิคภาษาอังกฤษตามที่วิศวกรไทยใช้ในสัมภาษณ์
- ไม่เปิดเผย secret, token, citizen ID handling ที่ละเอียดเกินความจำเป็น

## Scope

- สคริปต์พูด 2–3 นาที
- เวอร์ชันขยายถ้าถูกถามลึก
- ชุดคำถามต่อที่มักเจอ

## Out of scope

- ไม่แก้โค้ดระบบ
- ไม่สร้างสไลด์
- ไม่สรุป complaints เป็นโดเมนหลัก เพราะ schema ปัจจุบันไม่ได้เป็นแกนของระบบ

## Proposed workflow

1. อ่านโครงสร้าง frontend, backend, Prisma, auth, BFF
2. นับสเกลจากไฟล์, model, OpenAPI, route
3. เขียนสรุปภาษาไทยที่พูดได้จริง
4. แยกสคริปต์สั้นกับเวอร์ชันเจาะลึก

## Security and permission considerations

- Frontend role gating เป็น UX เท่านั้น ความปลอดภัยอยู่ที่ backend
- ในสัมภาษณ์ย้ำว่า token ไม่ถูกเก็บใน browser JS, juristic context ถูก revalidate ฝั่ง API ทุกครั้ง

## Implementation checklist

- [x] สำรวจ frontend App Router, BFF, hooks, stores
- [x] สำรวจ backend modules, guards, Prisma, auth flows
- [x] นับสเกลจากโค้ดจริง
- [x] เขียนสคริปต์สัมภาษณ์ภาษาไทย
- [x] สร้างไฟล์ Word โครงสร้างโฟลเดอร์พร้อมคำอธิบายภาษาไทย

## Validation checklist

- [x] ตัวเลขสเกลมาจากไฟล์จริง ไม่ใช่การกะคร่าว ๆ
- [x] ชื่อโดเมนตรง Prisma (`Business`, `InspectionTask`, `JuristicPerson`)
- [x] ไม่พูดว่า frontend เป็น security boundary
- [x] ไม่ใส่ secret จาก `.env` / README

## Progress log

- 2026-08-26: สำรวจ frontend และ backend, นับสเกล, เขียนสคริปต์สัมภาษณ์
- 2026-08-26: สร้างเอกสาร Word `docs/Topic-2-Code-Structure.docx` สำหรับให้ผู้ใช้แก้ต่อก่อนส่ง
- 2026-08-26: ปรับเอกสารใหม่ตามโจทย์จริง — แยกโปรเจกต์ frontend/backend, ขอบเขตงาน, สเกล/เทคคร่าว ๆ, tree โฟลเดอร์ที่ใช้จริง และตัวอย่างไฟล์ใน `docs/` น้ำเสียงให้เหมือนคนเขียนมากกว่าเดิม

## Changed files

- `plan/2026-08-26-interview-topic-2-code-structure.md`
- `plan/README.md`
- `docs/Topic-2-Code-Structure.docx`

## Open questions and risks

- Interviewer อาจถาม production traffic / จำนวนผู้ใช้จริง ซึ่ง repo ไม่ได้ระบุ — ตอบด้วยสเกลโค้ดและโดเมน ไม่เดา MAU
- บางหน้า frontend ยังมี `(legacy)` — อย่าพูดว่าระบบสะอาด 100% ให้พูดว่ากำลัง migrate อย่างมีแผน

---

# สคริปต์สัมภาษณ์

## เวอร์ชันพูด 2–3 นาที

ช่วง 3 ปีที่ผ่านมา โปรเจกต์หลักที่ผมขับคือแพลตฟอร์มตรวจสอบใบอนุญาตอิเล็กทรอนิกส์ หรือ E-License สำหรับหน่วยงานรัฐไทย ระบบรองรับประชาชน เจ้าหน้าที่ภาคสนาม และผู้ดูแลหน่วยงานในพอร์ทัลเดียวกัน

สเกลตอนนี้เป็นระบบ mid-size ที่แยก repo สองฝั่งชัดเจน ฝั่ง frontend เป็น Next.js 16 กับ React 19 ประมาณ 50 หน้า กว่า 100 คอมโพเนนต์ ฝั่ง backend เป็น NestJS 11 มี feature module ประมาณ 16 โมดูล Prisma schema ประมาณ 27 โมเดล PostgreSQL migrations 16 ชุด และ OpenAPI ประมาณ 70 path กว่า 70 operation โครงสร้างนี้รองรับหลายหน่วยงาน หลายบทบาท และนิติบุคคลแบบ multi-tenant

สถาปัตยกรรมหลักเป็น BFF เบราว์เซอร์ไม่ยิง backend โดยตรง แต่เรียก same-origin `/api/*` ของ Next.js แล้ว server proxy ไป NestJS Token ถูก harvest ใส่ httpOnly cookie ฝั่ง BFF โค้ด client เก็บแค่ display state เช่นชื่อผู้ใช้และโหมดพอร์ทัล ไม่เก็บ access token

หลังบ้านจัดโค้ดแบบ NestJS มาตรฐาน คือ `common/` สำหรับ guard decorator interceptor และ `modules/<feature>/` สำหรับโดเมน แต่ละโมดูลมี controller ที่บางมาก service เป็นเจ้าของธุรกิจและ Prisma ทุก request ผ่าน guard เรียงกัน JWT, client type, role, agency scope, แล้วค่อย juristic membership จริงจากฐานข้อมูล ไม่เชื่อค่าที่ frontend ส่งมา

โดเมนหลักมีสี่แกน ใบอนุญาตกับกิจการ นิติบุคคลแบบสลับบริบทได้ งานตรวจของเจ้าหน้าที่ และ identity จากทางรัฐทั้ง mToken และ DGA OIDC จุดที่ผมย้ำเวลาออกแบบคือ frontend เป็น UX gating เท่านั้น ขอบเขตความปลอดภัยอยู่ที่ API ทุกครั้ง

ถ้าถูกถามว่าโครงสร้างนี้ช่วยทีมยังไง ผมจะตอบว่าแยกหน้าที่ชัด ทำให้เพิ่มฟีเจอร์เป็นโมดูลได้โดยไม่แตะ auth กลาง และทำให้ขยายจากประชาชน สู่เจ้าหน้าที่ สู่ back office ได้บนสัญญา API ชุดเดียวกัน

---

## เวอร์ชันขยาย ถ้า interviewer อยากฟังลึก

### 1) โปรเจกต์นี้คืออะไร

ระบบ E-License / Certificate Tracking สำหรับหน่วยงานรัฐไทย

ผู้ใช้หลักมี 3 กลุ่ม:

| กลุ่ม | ใช้งานอะไร | พื้นผิว |
| --- | --- | --- |
| ประชาชน / เจ้าของใบอนุญาต | ค้นหาใบอนุญาต ดูสถานะ ส่งออกเอกสาร สลับโหมดบุคคลธรรมดา/นิติบุคคล | Mobile-first app |
| เจ้าหน้าที่ภาคสนาม | ลงพื้นที่ตรวจ ออกใบรายงาน สแกน QR ยืนยันตัวเจ้าหน้าที่ | Mobile-first app ในแอปทางรัฐ |
| Admin / Super Admin | จัดการหน่วยงาน ผู้ใช้ งานตรวจ ดู dashboard / audit | Desktop back office |

ระบบไม่ใช่ CRUD ธรรมดา เพราะต้องรับ identity จากทางรัฐ แยกบริบทบุคคลกับนิติบุคคล และบังคับขอบเขตข้อมูลตามหน่วยงานของเจ้าหน้าที่

### 2) สเกลและเทคสแตก จากโค้ดจริง

**Frontend**

- Next.js 16 App Router, React 19, TypeScript
- Bun เป็นตัวรันแพ็กเกจ
- Tailwind 4 + shadcn/ui
- TanStack Query, Zustand, React Hook Form, Zod
- Mapbox สำหรับแผนที่
- ประมาณ 50 หน้า, 117 คอมโพเนนต์, 23 hooks
- โค้ดแอปหลักประมาณ 38,000 บรรทัด

**Backend**

- NestJS 11, TypeScript
- PostgreSQL 16 + Prisma 7
- JWT RS256, Passport, Helmet, Throttler
- MinIO / S3 สำหรับไฟล์
- Swagger / OpenAPI เป็นสัญญาเชื่อม frontend
- 16 feature modules, 27 Prisma models, 16 migrations
- OpenAPI 69 paths / 77 operations
- โค้ด `src/` ประมาณ 14,000 บรรทัด

**Infra**

- Docker Compose แยกโหมด local / prod
- Nginx reverse proxy
- Cron ใน Nest สำหรับงานตามรอบ เช่นสถานะใบอนุญาต

ไม่ต้องพูดตัวเลขผู้ใช้จริงถ้าไม่มีข้อมูล ให้พูดสเกลของระบบและขอบเขตโดเมนแทน

### 3) ภาพสถาปัตยกรรม

```text
[ประชาชน / เจ้าหน้าที่]
        │ แอปทางรัฐ หรือเว็บ
        ▼
[Next.js BFF]
  app/api/[...path]
  - เก็บ access/refresh เป็น httpOnly cookie
  - ใส่ Authorization: Bearer ตอน forward
  - refresh อัตโนมัติเมื่อ backend ตอบ 401
        │ ภายในเครือข่าย
        ▼
[NestJS API]
  Guard เรียง: JWT → ClientType → Roles → Agency Scope → Juristic Membership
        │
        ├─ PostgreSQL (Prisma)
        ├─ MinIO/S3
        └─ External providers
              Tang Rat, DGA OIDC, DBD mock
```

จุดสำคัญที่ควรพูดเองโดยไม่ต้องรอถาม:

1. Browser ไม่รู้จัก origin ของ backend
2. Token ไม่เข้า `localStorage` และไม่เข้า Zustand
3. การสลับนิติบุคคลเก็บที่ session ฝั่งเซิร์ฟเวอร์ แล้ว API ตรวจ `JuristicMember` ใหม่ทุกครั้ง

### 4) โครงสร้าง Frontend ที่อธิบายได้ชัด

โปรเจกต์ใช้ single root tree ไม่มี `src/` และจัดตามหน้าที่ไม่ใช่ตามไฟล์กระจัดกระจาย

```text
app/
  (app)/            พอร์ทัลมือถือ: /home /businesses /licenses /inspection-tasks
  (back-office)/    เดสก์ท็อป: /agency-admin /super-admin
  auth/             login, DGA callback
  api/[...path]/    BFF catch-all
components/         ui, auth, app, map, shared
hooks/              data-fetching ต่อโดเมน
lib/http.ts         client ยิงเฉพาะ /api/*
server/backend.ts   cookie, harvest token, refresh
stores/auth.ts      display-only
```

หลักการที่ผมยึดตอนจัดโครงสร้าง:

- หน้าอยู่ใน `app/` ตาม route group ของผู้ใช้ ไม่ปน mobile กับ back office
- เรียก API ผ่าน `hooks/` + `lib/http.ts` ไม่ให้หน้ายิง fetch กระจัดกระจาย
- `server/` เป็น server-only จริง ๆ client import ไม่ได้
- หลัง `POST /auth/context` ต้อง `queryClient.clear()` เพราะ cache เป็นข้อมูลคนละบริบท
- juristic context ไม่เก็บ `localStorage` ใช้ session ฝั่งแท็บและสะท้อนใน URL เช่น `/businesses/[businessId]/licenses`

Route หลัง login ก็แยกตามบทบาท:

- `super_admin` → `/super-admin/dashboard`
- `admin` → `/agency-admin/inspections`
- `officer` → เลือกโหมดที่ `/role-select`
- `public` → `/home`

Frontend จึงเป็นชั้น UX และ navigation ไม่ใช่ชั้นอนุญาตจริง

### 5) โครงสร้าง Backend ที่อธิบายได้ชัด

จัดแบบ feature module ของ NestJS

```text
src/
  common/           guard, decorator, interceptor, role helper
  modules/
    auth/           login หลายช่องทาง, refresh, context switch
    license/        ใบอนุญาต สถานะ ownership
    business/       กิจการ
    juristic/       สมาชิกนิติบุคคล, invite, join request
    inspection/     งานตรวจในระบบหน่วยงาน
    officer/        รายงานภาคสนาม, QR profile
    my/             โปรไฟล์และใบอนุญาตของฉัน
    agency/ user/ audit/ dashboard/ export/ sync/ storage/ notification/
  prisma/
```

กติกาที่ทำให้ระบบไม่พังตอนขยายทีม:

- Controller บาง: รับ input แล้วโยนให้ service
- Service เป็นเจ้าของ Prisma และกฎธุรกิจ
- Query ที่เกี่ยวกับเจ้าหน้าที่กรองตาม `agencyId`
- Soft delete ใส่ `deletedAt: null` ทุก query ที่เกี่ยวกับ user / business / license
- เขียนหลายแถวใช้ `$transaction`
- Error ไม่เปิดเผยว่าบัญชีมีอยู่หรือไม่ โดยเฉพาะตอน login

Role ของแพลตฟอร์มเป็นลำดับขั้นเดียว:

`public < officer < admin < super_admin`

นอกจากนั้นนิติบุคคลมี role แยกอีกชั้น: `OWNER / ADMIN / MEMBER`

สองแกนนี้คนละเรื่อง:

- platform role = คุณเป็นใครในระบบรัฐ
- juristic role = คุณทำอะไรได้ในบริษัทนั้น

### 6) ตัดสินใจสถาปัตยกรรมที่ควรยกมาคุย

**BFF + httpOnly cookie**  
ไม่ให้ SPA ถือ token เพราะระบบรันใน WebView ของแอปทางรัฐ และมีหลาย client type ถ้า token รั่วจาก JS จะกระทบข้อมูลราชการ

**Authorization เป็นชั้น ๆ**  
JWT บอกว่าใคร login, RolesGuard บอกระดับสิทธิ์, ScopeGuard จำกัดหน่วยงาน, JuristicContextGuard ตรวจสมาชิกนิติบุคคลจาก DB แม้ JWT ยังไม่หมดอายุ ถ้าถูกถอดจากบริษัท ต้องเข้าไม่ได้ทันที

**สัญญา API เป็น source of truth**  
backend generate OpenAPI แล้ว frontend gen type ด้วย `bun run gen:api` ลดการเดา field ข้ามทีม

**Identity ไม่ปนกับ officer verification**  
`AuthProviderLink` ใช้ผูกทางรัฐเพื่อสร้างเซสชัน ส่วนการให้ประชาชนสแกน QR ตรวจว่าคนที่มาตรวจเป็นเจ้าหน้าที่จริง เป็นโดเมน `officer` แยกต่างหาก

**Ownership ของใบอนุญาตมีสองแบบ**  
บุคคลธรรมดาถือใบอนุญาตเอง หรือนิติบุคคลถือผ่านกิจการ การสลับ context จึงต้องกระทบ query ใบอนุญาตทันที ไม่ใช่แค่เปลี่ยนแท็บ UI

### 7) วิธีที่ผมขับโครงสร้างนี้ในทีม

ถ้าถูกถามว่า “คุณจัดโครงสร้างยังไงตอนลงมือ”

ผมจะตอบเป็นลำดับนี้:

1. ดูโดเมนจาก Prisma ก่อน แล้วตั้งชื่อ route / module ให้ตรงโมเดล ไม่ใช้ชื่อเก่าอย่าง establishment หรือ work order
2. แยกพื้นผิวผู้ใช้ก่อนลงมือทำหน้า mobile app คนละ layout กับ back office
3. ฟีเจอร์ใหม่ต้องผ่าน BFF เสมอ ห้ามยิง backend จากเบราว์เซอร์
4. กฎสิทธิ์รวมไว้ที่ backend helper ที่เดียว ไม่เช็ค `roles.includes('admin')` กระจัดกระจาย
5. งานใหญ่มี plan file บันทึกเหตุผล ขอบเขต และไฟล์ที่เปลี่ยน เพื่อให้คนถัดไปอ่านต่อได้โดยไม่ต้องง้อแชท

### 8) ข้อจำกัดและบทเรียน อย่าพูดว่าระบบเพอร์เฟกต์

พูดตรงนี้แล้วดู mature:

- ยังมี route group `(legacy)` จากการย้ายชื่อโดเมน แสดงว่าระบบผ่านช่วง redesign จริง ไม่ได้เริ่มสวยมาตั้งแต่ต้น
- Frontend gating ช่วย UX แต่ถ้าเผลอเชื่อค่าบน client จะเกิด data leak ทันที เลยต้องมี cache clear และ membership check ฝั่ง API
- External provider บางตัวยังเป็น mock / adapter เพราะหน่วยงานจริงยังต่อไม่ครบ โครงสร้างเลยออกแบบให้สลับ provider ได้ใน `modules/external/`
- อย่านับ complaints เป็นแกนหลักของระบบ ถ้า interviewer เปิดหน้านี้ ให้บอกว่าเป็นพื้นผิวที่ยังไม่เข้า schema ปัจจุบัน

### 9) ประโยคปิด ที่ทิ้งให้อยากถามต่อ

โครงสร้างนี้ทำให้ทีมเพิ่มฟีเจอร์ตามโดเมนได้โดยไม่ทำให้ auth และขอบเขตข้อมูลพัง และทำให้ระบบรัฐที่ผู้ใช้หลายประเภท ใช้สัญญาเดียวกันได้ทั้งมือถือและ back office

---

## คำถามต่อที่มักเจอ และคำตอบสั้น

**ทำไมไม่ให้ frontend ยิง NestJS ตรง ๆ**  
เพราะไม่อยากเปิด backend origin ให้เบราว์เซอร์ และไม่อยากให้ JS ถือ token การ refresh กับ cookie ควรอยู่จุดเดียว

**ทำไมมีทั้ง platform role กับ juristic role**  
คนคนเดียวอาจเป็นประชาชนเจ้าของกิจการ และเป็นสมาชิกบริษัทอื่นพร้อมกัน สิทธิ์ระดับระบบกับสิทธิ์ในบริษัทต้องแยก ไม่เช่นนั้น admin บริษัทจะกลายเป็น admin ระบบ

**ข้อมูลเจ้าหน้าที่ถูกจำกัดยังไง**  
officer ต้องมี `agencyId` ทุก query งานตรวจและใบอนุญาตกรองตามหน่วยงานของตัวเอง admin tier เห็นภาพรวมได้เพราะ scope เป็น `null` แบบตั้งใจ

**ถ้าถูกถอดจากนิติบุคคลแล้วยังถือ JWT อยู่**  
`JuristicContextGuard` เช็ค `JuristicMember` สดจากฐานข้อมูล ถ้า membership ไม่ active จะ 403 แม้ token ยังไม่หมดอายุ

**OpenAPI ช่วยอะไร**  
frontend ไม่เดา DTO เอง เวลา backend เปลี่ยน field เรา regenerate type แล้ว typecheck จับทันที

**คุณจะเริ่มยังไงถ้าเข้ามาเป็นคน drive โครงสร้างต่อ**  
เก็บสัญญา API และ Prisma เป็นแหล่งความจริงเดียว เคลียร์ legacy route ให้หมด แล้วขยายโมดูลตามโดเมนไม่ตามหน้าจอ

---

## สิ่งที่ไม่ควรพูดในสัมภาษณ์

- ไม่พูดตัวเลขผู้ใช้จริง ถ้าไม่มีข้อมูล
- ไม่พูด citizen ID ถูกเก็บแบบ plaintext เว้นแต่ถูกถามเรื่อง data classification โดยตรง และต้องเล่าบริบท TDE / RBAC / audit
- ไม่พูดว่า frontend ป้องกันสิทธิ์ได้
- ไม่พูดว่า complaints เป็นโมเดลหลัก
- ไม่เปิดค่า secret จาก `.env`
