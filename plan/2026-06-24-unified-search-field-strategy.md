# Unified Search Field Strategy

วันที่สร้าง: 2026-06-24  
สถานะ: Planned  
Implementation: Not started  
หมายเหตุสำคัญ: แผนนี้เป็นฟีเจอร์เพิ่มเติม ยังไม่ต้อง implement จนกว่าจะมีคำสั่งชัดเจน

## 1. Context

UX/UI designer ออกแบบช่อง search ให้สามารถค้นข้อมูลได้มากกว่า 1 ประเภทในช่องเดียว เช่น:

- ค้นหาใบอนุญาตด้วยเลขใบอนุญาต
- ค้นหาสถานประกอบการ / Business ด้วยชื่อสถานประกอบการ

ปัญหาหลักคือข้อมูลสองประเภทนี้มีรูปแบบ input และ destination route ต่างกัน:

| Data type | User input ที่คาดหวัง | Result target |
| --- | --- | --- |
| License | เลขใบอนุญาต, เลขที่มี `/`, `-`, หรือ URL จาก QR | `/licenses/[id]` |
| Business | ชื่อสถานประกอบการ, ชื่อนิติบุคคล, ชื่อร้านค้า | `/businesses/[businessId]` |

แผนนี้กำหนดแนวทาง best practice เพื่อไม่ให้ search logic ปนกันใน UI component เดียวจน maintain ยาก

## 2. Decision

ใช้ search component กลางได้ แต่ต้องแยก search domain, data source, validation, result type, และ navigation behavior ออกจากกัน

ไม่ควรทำแบบนี้:

```ts
if (Number(query)) {
  searchLicense(query);
} else {
  searchBusiness(query);
}
```

เหตุผล:

- เลขใบอนุญาตอาจมี `/`, `-`, ตัวอักษร prefix หรือ QR URL
- ชื่อสถานประกอบการอาจมีตัวเลข เช่น `7-Eleven`, `โรงงาน 304`, `บริษัท 168 จำกัด`
- ถ้าใช้ numeric-only rule จะทำให้ผลลัพธ์ผิด domain ได้ง่าย
- UX จะสับสนถ้าผลลัพธ์หลายประเภทถูกยำรวมโดยไม่มี type/badge

แนวทางที่เลือก:

- สร้าง reusable UI component เช่น `SmartSearchBox`
- แยก search behavior ด้วย config `domains`
- สร้าง hook รวม logic เช่น `useUnifiedSearch`
- แสดงผลลัพธ์แบบ grouped result ตามประเภทข้อมูล
- ใช้ heuristic เพื่อจัดลำดับผลลัพธ์ ไม่ใช่ตัดสินแบบ absolute ว่าต้องค้น domain เดียวเท่านั้น

## 3. Proposed file structure

ยังไม่ต้องสร้างไฟล์เหล่านี้ตอนนี้ เป็นเพียง proposal:

```txt
components/search/
  smart-search-box.tsx
  search-result-list.tsx
  search-empty-state.tsx
  search-types.ts

hooks/
  useUnifiedSearch.ts
  useLicenseSearch.ts
  useBusinessSearch.ts
```

## 4. Proposed types

```ts
type SearchDomain = "license" | "business";

type LicenseSearchResult = {
  type: "license";
  id: string;
  licenseNumber: string;
  holderName: string;
  licenseName?: string;
};

type BusinessSearchResult = {
  type: "business";
  id: string;
  businessName: string;
  address?: string;
};

type SearchResult = LicenseSearchResult | BusinessSearchResult;
```

## 5. Component usage pattern

### 5.1 Unified search page

ใช้เมื่อช่องเดียวต้องค้นได้ทั้ง license และ business:

```tsx
<SmartSearchBox
  domains={["license", "business"]}
  placeholder="ค้นหาเลขใบอนุญาต หรือชื่อสถานประกอบการ"
/>
```

### 5.2 License-only page

ใช้ในหน้าที่ context เป็นใบอนุญาตเท่านั้น:

```tsx
<SmartSearchBox
  domains={["license"]}
  placeholder="ค้นหาเลขใบอนุญาต"
/>
```

### 5.3 Business-only page

ใช้ในหน้าที่ context เป็นสถานประกอบการเท่านั้น:

```tsx
<SmartSearchBox
  domains={["business"]}
  placeholder="ค้นหาชื่อสถานประกอบการ"
/>
```

## 6. Search intent detection

ใช้ intent detection เพื่อจัดลำดับ data source ไม่ใช่เพื่อล็อก domain แบบเด็ดขาด

ตัวอย่าง logic:

```ts
function detectSearchIntent(query: string): SearchDomain[] {
  const normalized = query.trim();

  const looksLikeLicense =
    /^[0-9A-Za-z/-]+$/.test(normalized) &&
    normalized.length >= 4;

  const looksLikeBusinessName =
    /[ก-๙a-zA-Z]/.test(normalized);

  if (looksLikeLicense && looksLikeBusinessName) {
    return ["license", "business"];
  }

  if (looksLikeLicense) {
    return ["license", "business"];
  }

  return ["business"];
}
```

หลักการ:

- ถ้าคล้ายเลขใบอนุญาต ให้ prioritize license ก่อน แต่ยังค้น business ได้
- ถ้ามีตัวอักษรไทย/อังกฤษ ให้ prioritize business ก่อน
- ถ้า query มาจาก QR URL ให้ parse license id ก่อน แล้ว verify กับ backend
- ห้ามตัด business ออกเพียงเพราะ query เป็นตัวเลข

## 7. Result rendering UX

ผลลัพธ์ควรแยกหมวด:

```txt
ใบอนุญาต
- ใบอนุญาตเลข 5621-17/965
- ใบอนุญาตเลข 1234/2567

สถานประกอบการ
- บริษัท ตัวอย่าง จำกัด
- โรงงาน 304
```

แต่ละ result ควรมี:

- type badge เช่น `ใบอนุญาต`, `สถานประกอบการ`
- title ที่อ่านออกทันที
- secondary text เช่น holder name, address, license name
- click target ที่ชัดเจน

Navigation:

| Result type | Target |
| --- | --- |
| `license` | `/licenses/[id]` |
| `business` | `/businesses/[businessId]` |

## 8. Enter key behavior

เมื่อ user กด Enter:

1. ถ้ามี exact license match เดียว
   - navigate ไป `/licenses/[id]`
2. ถ้ามี exact business match เดียว
   - navigate ไป `/businesses/[businessId]`
3. ถ้ามีหลาย result
   - แสดง grouped result ต่อ หรือไปหน้า search result กลาง
4. ถ้าไม่พบข้อมูล
   - แสดง empty state แยก domain

ตัวอย่าง empty state:

- `ไม่พบใบอนุญาตเลขนี้`
- `ไม่พบสถานประกอบการที่ตรงกับคำค้น`

## 9. Backend/API options

มี 2 แนวทางที่รับได้:

### Option A: Unified endpoint

```txt
GET /search?q=...&types=license,business
```

ข้อดี:

- backend เป็นคน rank result ได้
- frontend ได้ contract เดียว
- เหมาะถ้าจะทำ autocomplete/global search จริงจัง

ข้อเสีย:

- ต้องออกแบบ search service กลาง
- backend ต้องรวม permission/visibility rules ของหลาย domain

### Option B: Separate endpoints แล้ว frontend รวมผลลัพธ์

```txt
GET /licenses/search?q=...
GET /businesses/search?q=...
```

ข้อดี:

- implement ง่ายกว่า
- reuse endpoint เดิมได้
- domain permission แยกชัด

ข้อเสีย:

- frontend ต้องรวม result/ranking เอง
- ต้องจัดการ loading/error หลาย source

Recommendation:

- ระยะสั้นใช้ Option B
- ระยะยาวถ้า search กลายเป็น feature หลัก ให้ย้ายไป Option A

## 10. Security and permission rules

Search result ต้องไม่ leak ข้อมูลที่ user ไม่มีสิทธิเห็น

กฎที่ต้องยึด:

- License result ต้อง filter ตามสิทธิของ user หรือ public visibility policy
- Business result ต้อง filter ตาม visibility policy
- ถ้า search ใน juristic/business context ต้อง revalidate membership ฝั่ง backend
- ห้ามใช้ frontend เป็นตัวตัดสินสิทธิ
- ถ้ามี officer mode ต้องให้ backend ตรวจ role `inspection_officer` ก่อนแสดง action พิเศษ

## 11. Where this may apply later

Route ที่อาจนำ plan นี้ไปใช้ในอนาคต:

| Route | Possible domains |
| --- | --- |
| `/home` | license, business |
| `/license-search` | license, business ถ้า designer ต้องการ search รวม |
| `/licenses` | license เป็นหลัก อาจเพิ่ม business context |
| `/businesses` | business เป็นหลัก |
| `/e-map` | business, license-related document |
| `/reports` | inspection task ในอนาคต |

## 12. Implementation phases

ยังไม่ต้องทำตอนนี้ ถ้าจะเริ่มทำในอนาคตให้ทำตามลำดับนี้:

1. Audit search fields ทั้งหมดใน mobile app
2. ระบุว่าแต่ละหน้าต้องใช้ domain ไหน
3. สร้าง `SearchDomain` และ `SearchResult` types
4. สร้าง `useLicenseSearch` และ `useBusinessSearch`
5. สร้าง `useUnifiedSearch`
6. สร้าง `SmartSearchBox` และ grouped result UI
7. Replace search เฉพาะจุดที่ UX ต้องการ unified search ก่อน
8. เพิ่ม loading/error/empty state
9. ตรวจ permission กับ backend
10. รัน typecheck/lint/build เฉพาะ scope

## 13. Current status

- ยังไม่ implement
- ยังไม่มีไฟล์ component/hook ใหม่
- ยังไม่เปลี่ยน behavior ของ search field ปัจจุบัน
- แผนนี้เป็น architectural/UX guidance สำหรับ feature เพิ่มเติมเท่านั้น

