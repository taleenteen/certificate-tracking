# E-License & Certificate Tracking (Frontend)

ระบบติดตามใบอนุญาตและใบรับรอง (E-License & Certificate Tracking Platform) พัฒนาขึ้นด้วย **Next.js (App Router)** ร่วมกับ **React 19** และจัดการระบบแพ็กเกจด้วย **Bun** โดยทำงานประสานกับ Backend ผ่านรูปแบบ **BFF (Backend-for-Frontend) Proxy** เพื่อความปลอดภัยสูงสุดในการจัดการ Session และ Authentication Tokens

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้ใช้โครงสร้างแบบ **Single Root Tree** (ไม่มีโฟลเดอร์ `src/` ตามข้อกำหนดหลักของระบบ) โดยมีรายละเอียดโครงสร้างดังนี้:

```text
certificate-tracking/           ← โฟลเดอร์หลักของโปรเจกต์ (Repo Root)
├── app/                        ← Next.js App Router (Pages, Layouts และ Route Handlers)
│   ├── (entry)/                ← หน้าหลักรองรับ Mobile-first (มีตัวเลือก บุคคลธรรมดา และ เจ้าหน้าที่)
│   ├── (app)/                  ← พอร์ทัลใช้งานบนมือถือ (หน้าหลัก, รายชื่อธุรกิจ, ใบอนุญาต, งานตรวจ, โปรไฟล์)
│   ├── (back-office)/          ← พอร์ทัลใช้งานบนเว็บ/เดสก์ท็อป (ผู้ดูแลระบบ, ผู้ควบคุมโซน, Super Admin)
│   └── api/[...path]/          ← BFF Catch-all Proxy Route Handler (ทำงานเฉพาะบน Server เท่านั้น)
├── components/                 ← ส่วนประกอบ UI ของแอปพลิเคชัน
│   ├── ui/                     ← shadcn/ui primitives เช่น Button, Card, Dialog, Select
│   ├── back-office/            ← คอมโพเนนต์เฉพาะสำหรับส่วนจัดการ Web Admin
│   ├── shared/                 ← คอมโพเนนต์ที่ใช้ร่วมกันในหลายจุดของระบบ
│   ├── icons/                  ← ไอคอนคอมโพเนนต์ที่เป็น SVG
│   ├── auth/                   ← ส่วนการควบคุมสิทธิ์การเข้าถึง หน้าเข้าสู่ระบบ และการลงทะเบียน
│   └── providers/              ← React Providers หลักของระบบ เช่น QueryClient, ThemeProvider
├── hooks/                      ← React Hooks สำหรับการจัดการ Fetching ข้อมูล และ Logic เฉพาะด้าน
├── lib/                        ← ยูทิลิตี้พื้นฐานของระบบ เช่น การตั้งค่า http client (`lib/http.ts`), ตัวจัดรูปแบบเวลา
├── server/                     ← โค้ดส่วน BFF (Backend-for-Frontend) ทำงานบน Server-only ห้ามนำไปใช้งานใน Client Component
│   └── backend.ts              ← ตัวจัดการคุกกี้, การเก็บเกี่ยว token และระบบ Auto-Refresh (401)
├── stores/                     ← Zustand Client-side State Store (เก็บสถานะสำหรับแสดงผลเท่านั้น ไม่มีโทเค็นความปลอดภัย)
│   ├── auth.ts                 ← บันทึกสถานะผู้ใช้และบริบทของนิติบุคคล (Juristic context) แบบชั่วคราว
│   └── useMapStore.ts          ← สถานะพิกัดและการแสดงผลบนแผนที่
├── services/                   ← ฟังก์ชันเรียกใช้ API แต่อยู่บน wrapper ของ http client
├── types/                      ← ไฟล์ประกาศประเภทข้อมูล TypeScript (TypeScript Interfaces & Types)
├── utils/                      ← ฟังก์ชันยูทิลิตี้ทั่วไป
├── constants/                  ← ตัวแปรและค่าคงที่ทั้งหมดในระบบ
├── assets/                     ← ไฟล์ภาพ และ Static Assets ต่าง ๆ
├── styles/                     ← สไตล์ชีตหลัก (Global CSS) และชุด Tailwind CSS
└── plan/                       ← เอกสารขั้นตอนและแผนการดำเนินการสำหรับทีมนักพัฒนา
```

---

## 🔐 การตั้งค่า Environment Variables (`.env`)

ในการรันโปรเจกต์นี้ จำเป็นต้องสร้างไฟล์ `.env.local` หรือติดตั้ง Environment Variables ดังตัวอย่างต่อไปนี้:

```env
# URL ของบริการแผนที่ Mapbox (สมัครรับ Token ได้ที่ https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...your_mapbox_token...

# BFF Configuration (สำคัญมากสำหรับการทำงานแบบ Server-side)
# ใช้ระบุที่อยู่ของเครื่อง Backend Server ภายในระบบ (Browser จะเข้าถึงผ่าน proxy /api เท่านั้น)
BACKEND_INTERNAL_URL=http://localhost:3001

# ตัวเลือกเสริม (สำหรับบางฟังก์ชันที่ต้องการเรียกใช้ API แบบดั้งเดิม)
NEXT_PUBLIC_API_URL=http://localhost:3001

# การเชื่อมต่อระบบตรวจสอบสิทธิ์และข้อมูลประจำตัว (Tang Rat / Identity Service)
NEXT_PUBLIC_IAM_GOV_FRONTEND_URL=https://auth.govcenter.co
GOV_API_URL=http://localhost:3001

# ข้อมูลการตั้งค่า LINE Login Integration
NEXT_PUBLIC_LINE_CHANNEL_ID=2008946775
NEXT_PUBLIC_LINE_CALLBACK_URL=http://api-auth.govcenter.co/auth/line/callback

# คีย์การเชื่อมต่อและเรียกใช้ e-Service
NEXT_PUBLIC_E_SERVICE_CODE=gov-center
E_SERVICE_API_KEY=sk_363f448648457976c7616b3c04c2aa4cd3aa105b79d4260db843dc40f8ea5b3c

# JWT Secret Key สำหรับการถอดรหัสโทเค็นในตัวอย่างระบบ
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛠️ การใช้งานคำสั่งในระดับนักพัฒนา (Getting Started & Development Commands)

โปรเจกต์นี้มีข้อกำหนดด้านเทคนิคให้ใช้ **Bun** ในการจัดการแพ็กเกจและการรันคำสั่งทั้งหมด โดยหลีกเลี่ยงการใช้ `npm` หรือ `yarn` เพื่อหลีกเลี่ยงปัญหาการขัดแย้งของไฟล์ติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
bun install
```

### 2. การสร้าง TypeScript types จาก OpenAPI (Backend)
เมื่อมีการเปลี่ยนแปลงโครงสร้างของฐานข้อมูลหรือ Backend APIs ให้ดึง Type Definition มาอัปเดตบน Frontend:
```bash
bun run gen:api
```

### 3. การสร้างสไตล์และ Tokens
หากมีการอัปเดตไฟล์โทเค็นการออกแบบ (`design-tokens.tokens.json`) ให้รันคำสั่งด้านล่างเพื่อแปลงเป็นคลาส CSS:
```bash
bun run build:tokens
```

### 4. รันแอปพลิเคชันสำหรับพัฒนา (Development Mode)
หน้าเว็บของแอปพลิเคชันจะรันบนพอร์ต **3003** เป็นค่าเริ่มต้น:
```bash
bun run dev
```
เปิดใช้งานผ่านบราวเซอร์ที่: [http://localhost:3003](http://localhost:3003)

### 5. การตรวจสอบความเรียบร้อยของโค้ด (Linting)
```bash
bun run lint
```

---

## 🚀 การ Build และรันในสภาวะการผลิต (Production Build & Execution)

ในการรันสำหรับใช้งานจริงในสภาพแวดล้อม Production:

```bash
# 1. Build แอปพลิเคชัน
bun run build

# 2. เริ่มต้นรันแอปพลิเคชัน (จะทำงานบนพอร์ต 3003)
bun run start
```

---

## 🐳 การใช้งานร่วมกับ Docker (Docker Deployment)

โปรเจกต์รองรับการทำงานในแบบ Containerized Environment โดยได้กำหนดค่าให้เหมาะสมกับเทคโนโลยี Next.js Standalone Build ไว้ใน `Dockerfile`

### 1. การตั้งค่า Network
ก่อนเริ่มต้นติดตั้งและสร้าง Container ให้ตรวจสอบให้แน่ใจว่าได้ระบุหรือสร้าง Network ของ Docker ให้ตรงตามที่ระบุในไฟล์ `docker-compose.yml`:
```bash
docker network create gov_smartcity
```

### 2. สร้างภาพและเปิดใช้งานตู้คอนเทนเนอร์ (Build & Run Containers)
รันคำสั่งเพื่อทำการ build และ start บริการ frontend ในโหมด Background:
```bash
docker compose up -d --build
```
ระบบจะอ้างอิงและใช้พอร์ต **4003** (หรือพอร์ตที่ระบุไว้ในตัวแปร `FRONTEND_PORT`) เป็นช่องทางติดต่อจากภายนอก

### 3. ตรวจสอบสถานะการทำงาน
```bash
docker compose ps
```

### 4. การรันแบบ Full-Stack ด้วยตัวอย่าง Docker Compose (Backend + DB + Frontend)
หากต้องการรันเพื่อการสาธิตระบบหรือทำสภาพแวดล้อมจำลองทั้งหมด (DB + NestJS Backend + Next.js Frontend) ให้รันด้วยตัวเลือกไฟล์ `-f`:
```bash
docker compose -f docker-compose.example.yml up -d --build
```

---

## 🛡️ สถาปัตยกรรมความปลอดภัยที่ควรทราบ (Security Architecture)

- **BFF (Backend-for-Frontend) Proxy Pattern:** แอปพลิเคชันมีโครงสร้างความปลอดภัยที่ไม่เก็บบันทึกข้อมูล tokens (`accessToken`, `refreshToken`) ไว้บน Browser (ทั้งใน LocalStorage หรือ SessionState/Zustand Store) แต่จะถูกกรองและบันทึกไว้ในรูปแบบ **httpOnly Cookies** บน Server ของ Next.js ซึ่ง Browser จะเข้าถึง APIs โดยผ่าน `/api/*` เท่านั้น
- **Juristic & Business Context Switching:** สภาพการเปลี่ยนสิทธิ์นิติบุคคล จะไม่ถูกบันทึกไว้ใน LocalStorage แต่จะใช้ `sessionStorage` เพื่อป้องกันข้อมูลรั่วไหลข้ามแท็บ (Tab Isolation) และจะทำการเคลียร์ข้อมูลใน Cache (`queryClient.clear()`) เสมอหลังการสลับบริบท
