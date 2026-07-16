# ระบบหน้าบ้าน e-License

เว็บแอปพลิเคชันสำหรับใช้งานระบบใบอนุญาตอิเล็กทรอนิกส์ รองรับการใช้งานทั้งมือถือและเดสก์ท็อป ผู้ใช้งานสามารถดูใบอนุญาต สถานประกอบการ แผนที่ และข้อมูลนิติบุคคล ส่วนเจ้าหน้าที่สามารถค้นหาและส่งออกเอกสารใบอนุญาตตามสิทธิ์ที่ได้รับ

## ประสบการณ์ผู้ใช้งาน

- Mobile-first สำหรับผู้ใช้งานผ่านเว็บและ WebView ของแอปทางรัฐ
- Desktop layout สำหรับงานค้นหา รายการข้อมูล และส่วนจัดการผู้ดูแล
- ใช้ Next.js BFF เพื่อให้ browser ไม่ถือ access token หรือ refresh token โดยตรง
- รองรับภาษาไทยสำหรับข้อมูลและหน้าจอที่ผู้ใช้งานพบ

## ฟีเจอร์หลัก

- เข้าสู่ระบบด้วยทางรัฐผ่าน mToken หรือ OIDC ตามค่า `NEXT_PUBLIC_DGA_AUTH_FLOW`
- เลือกโหมดผู้ใช้งานทั่วไปหรือเจ้าหน้าที่สำหรับบัญชีที่มีสิทธิ์เจ้าหน้าที่
- แสดงใบอนุญาตของบุคคลธรรมดา นิติบุคคล และสถานประกอบการ
- แสดงภาพหน้าแรกของเอกสาร PDF บนการ์ดใบอนุญาต และเปิดเอกสารฉบับเต็มได้
- ค้นหาสถานประกอบการและใบอนุญาต พร้อมขยายดูรายการใบอนุญาตภายในสถานประกอบการ
- e-Map ด้วย Mapbox แสดงพิกัดสถานประกอบการและเชื่อมไปยังรายละเอียดที่เกี่ยวข้อง
- เปิดเส้นทาง Google Maps และเปิด URL ภายนอกจาก QR Code ของใบอนุญาต
- เจ้าหน้าที่ส่งออกใบอนุญาตรายใบหรือหลายใบ พร้อมข้อมูลอ้างอิงการส่งออก
- ผู้ดูแลระบบจัดการบัญชีผู้ใช้ สิทธิ์ และหน่วยงานผ่านหน้าจอ back office

## ความปลอดภัย

- การเรียก API จาก browser ผ่าน `/api/*` ของ Next.js BFF เท่านั้น
- token ถูกย้ายไปเก็บใน httpOnly cookie ฝั่ง server และไม่เก็บใน Zustand หรือ localStorage
- เมื่อสลับบริบทนิติบุคคล ระบบล้าง cache ของข้อมูลเดิมก่อนโหลดข้อมูลใหม่
- หน้า mToken ล้างข้อมูล session เดิมและ query cache ก่อนแลกเปลี่ยนตัวตน เพื่อป้องกันการแสดงข้อมูลของบัญชีก่อนหน้าใน WebView

## เทคโนโลยี

- Next.js 16, React 19 และ TypeScript
- Tailwind CSS และ shadcn/ui
- TanStack Query สำหรับ server state
- Zustand สำหรับสถานะการแสดงผลฝั่ง client
- Mapbox สำหรับ e-Map และ PDF.js สำหรับ preview เอกสาร PDF

## การตั้งค่า

ใช้ไฟล์ `.env` ในโฟลเดอร์ frontend นี้ ค่าเริ่มต้นที่จำเป็นมีตัวอย่างดังนี้:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_MAPBOX_TOKEN=...
NEXT_PUBLIC_DGA_AUTH_FLOW=mtoken
NEXT_PUBLIC_MTOKEN_DEBUG=false
```

`NEXT_PUBLIC_MTOKEN_DEBUG=true` ใช้เฉพาะ UAT เพื่อแสดงสถานะการรับ mToken และ appId บนหน้า `/auth/dga` ห้ามเปิดไว้ในหน้าใช้งานจริง และไม่มีการแสดงค่า mToken

## การ Build และ Deploy

Frontend ถูก build ผ่าน production compose ของ backend เนื่องจากใช้ Docker network ร่วมกัน:

```bash
cd ../certificate-tracking-backend
sh scripts/production-stack.sh frontend-up
```

คำสั่งนี้ build และ restart เฉพาะ frontend โดยไม่ restart backend, PostgreSQL หรือ MinIO ค่า `NEXT_PUBLIC_*` จะถูกฝังใน build จึงต้อง build ใหม่ทุกครั้งหลังแก้ไฟล์ `.env`.
