# คู่มือทำ DGA Digital ID / ทางรัฐ แบบ OIDC บน Next.js + SQLite

เอกสารนี้เขียนให้แชทหรือโปรเจกต์ใหม่ที่**ยังไม่มีความรู้เรื่องทางรัฐ** อ่านแล้วทำได้เอง

เป้าหมาย: ให้ผู้ใช้กด “เข้าสู่ระบบด้วยทางรัฐ” จากเว็บบราว์เซอร์ แล้วได้ session ของแอปคุณเอง โดยพิสูจน์ตัวตนผ่าน DGA Digital ID (OpenID Connect 1.0)

ไม่ครอบคลุมเส้น **mToken** ซึ่งใช้เมื่อเปิดจากแอปทางรัฐ/WebView แล้วส่ง `mToken` + `appId` มา คนละโปรโตคอล คนละ credential ห้ามปน

---

## 0. อ่านก่อนลงมือ 2 นาที

ทางรัฐในที่นี้คือระบบพิสูจน์ตัวตนของ สพร. (DGA)

OIDC ทำงานแบบนี้:

1. เว็บคุณพาผู้ใช้ไปหน้า login ของ DGA
2. ผู้ใช้ล็อกอินที่นั่น (ไม่กรอกรหัสในเว็บคุณ)
3. DGA ส่งผู้ใช้กลับมาเว็บคุณพร้อม `code` สั้น ๆ
4. **เซิร์ฟเวอร์ของคุณ** เอา `code` ไปแลกข้อมูลตัวตนกับ DGA
5. เซิร์ฟเวอร์สร้าง/หา user ใน SQLite แล้วออก session ของแอปคุณ

กฎเหล็ก:

- Browser **ห้าม** เรียก `/connect/token` หรือ `/connect/userinfo` ของ DGA
- `DGA_OIDC_CLIENT_SECRET` อยู่ที่เซิร์ฟเวอร์เท่านั้น ห้ามขึ้น `NEXT_PUBLIC_*`
- อย่าใช้ access token ของ DGA เป็น session ของแอปคุณ
- อย่าเก็บ `code`, `id_token`, `access_token` ของ DGA ใน `localStorage`

โปรเจกต์นี้เป็น Next.js fullstack ดังนั้น Route Handler (`app/api/...`) คือฝั่ง server ที่คุยกับ DGA ส่วนหน้าเว็บแค่เริ่ม login และรับ callback

---

## 1. คำศัพท์

| คำ | ความหมาย |
| --- | --- |
| DGA / Digital ID / ทางรัฐ | ผู้ให้บริการล็อกอินภาครัฐ |
| OIDC | มาตรฐาน OpenID Connect ที่ DGA ใช้กับเว็บบราว์เซอร์ |
| `client_id` | รหัสแอปที่ DGA ออกให้หลังลงทะเบียน |
| `client_secret` | ความลับของแอป อยู่ที่เซิร์ฟเวอร์เท่านั้น |
| `redirect_uri` | URL ที่ DGA ส่งผู้ใช้กลับมา ต้องลงทะเบียนล่วงหน้า และต้องตรงทุกตัวอักษร |
| `scope` | ข้อมูลที่ขอ เช่น เลขบัตร ชื่อ |
| `state` | ค่าสุ่มที่เซ็นไว้ กัน CSRF และใช้ครั้งเดียว |
| `code` | รหัสใช้ครั้งเดียว ที่ DGA ส่งกลับมาใน query |
| `access_token` ของ DGA | ใช้เรียก UserInfo ของ DGA เท่านั้น อายุสั้น |
| `id_token` ของ DGA | ใช้ตอน logout ที่ DGA เก็บฝั่งเซิร์ฟเวอร์ |
| session ของแอป | cookie ของคุณเองหลัง login สำเร็จ |

---

## 2. สิ่งที่ต้องได้จาก DGA ก่อนเขียนโค้ด

ลงทะเบียนแอปกับ DGA Digital ID แล้วขอค่าเหล่านี้:

- `client_id`
- `client_secret`
- ลงทะเบียน callback URL เช่น `https://your-domain.com/auth/login-callback`
- ลงทะเบียน logout callback เช่น `https://your-domain.com/auth/logout-callback`
- ขอ scope: `openid citizen_id given_name family_name`

โฮสต์ของ DGA:

| สภาพแวดล้อม | Base URL |
| --- | --- |
| UAT | `https://connect.dga.or.th` |
| Production | `https://connect.egov.go.th` |

endpoint ที่ใช้จริง (ต่อท้าย base URL):

```text
GET  /connect/authorize     ← พาคนไปล็อกอิน
POST /connect/token         ← แลก code เป็น token ของ DGA
GET  /connect/userinfo      ← ดึงชื่อ / เลขบัตร
GET  /connect/endsession    ← ออกจากระบบที่ DGA
```

ถ้ายังไม่มี credential ให้ทำโหมด mock ตามหัวข้อ 10 ก่อน อย่าเดาส่งขึ้น UAT

---

## 3. ไฟล์และหน้าใน Next.js ที่ต้องมี

```text
app/
  auth/
    dga/page.tsx                 ← กดแล้วเริ่ม login
    login-callback/page.tsx      ← DGA ส่งกลับมาที่นี่ พร้อม ?code=&state=
    logout-callback/page.tsx     ← DGA ส่งกลับมาหลัง logout
  api/
    auth/
      dga/
        authorize/route.ts       ← สร้าง authorizeUrl + state
        callback/route.ts        ← แลก code, หา user, ออก session
      logout/route.ts            ← ลบ session ของแอป อาจคืน endSessionUrl
lib/
  dga-oidc.ts                    ← คุยกับ DGA ทั้งหมด (server-only)
  oidc-state.ts                  ← เซ็น/ตรวจ state
  db.ts                          ← SQLite
.env.local                       ← secret อยู่ที่นี่
```

หน้าที่ผู้ใช้เห็นมี 3 หน้า ที่เหลือเป็น API ฝั่งเซิร์ฟเวอร์

---

## 4. Environment variables

ใส่ใน `.env.local` ของ Next.js **ห้าม** prefix `NEXT_PUBLIC_` ให้ secret

```env
# โหมด: mock = ยังไม่ยิง DGA, real = ยิงของจริง
DGA_OIDC_MODE=mock

# UAT หรือ production
DGA_OIDC_ENV=uat
DGA_OIDC_BASE_URL=https://connect.dga.or.th

DGA_OIDC_CLIENT_ID=
DGA_OIDC_CLIENT_SECRET=

# ต้องตรงกับที่ลงทะเบียนกับ DGA ทุกตัวอักษร รวม http/https และไม่มี slash ท้ายถ้าไม่ได้ลงไว้
DGA_OIDC_REDIRECT_URI=http://localhost:3000/auth/login-callback
DGA_OIDC_ALLOWED_REDIRECT_URIS=http://localhost:3000/auth/login-callback
DGA_OIDC_LOGOUT_REDIRECT_URI=http://localhost:3000/auth/logout-callback

DGA_OIDC_SCOPE=openid citizen_id given_name family_name

# สุ่มยาวอย่างน้อย 32 ตัว ใช้เซ็น state
DGA_OIDC_STATE_SECRET=change-me-to-a-long-random-string

# สุ่มยาวอย่างน้อย 32 ตัว ใช้เข้ารหัส id_token ตอนเก็บใน SQLite
DGA_OIDC_ID_TOKEN_ENCRYPTION_KEY=change-me-to-another-long-random-string

# session cookie ของแอปคุณเอง
APP_SESSION_SECRET=change-me-app-session-secret
```

ขึ้นของจริงค่อยตั้ง `DGA_OIDC_MODE=real` และใส่ `CLIENT_ID` / `CLIENT_SECRET`

`redirect_uri` ของ localhost กับโดเมนจริงเป็นคนละค่า ต้องลงทะเบียนทั้งคู่ถ้าจะเทสทั้งสองที่

---

## 5. ตาราง SQLite ขั้นต่ำ

ใช้ `better-sqlite3` หรือ Prisma + SQLite ก็ได้ โครงเดียวกัน

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  citizen_id    TEXT UNIQUE,
  citizen_last4 TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ผูกบัญชีแอปกับตัวตนทางรัฐ
-- provider_sub คือค่าถาวรจาก DGA (czp_user / sub) ไม่ใช่ code
CREATE TABLE auth_provider_links (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  provider      TEXT NOT NULL DEFAULT 'tang_rat',
  provider_sub  TEXT NOT NULL,
  provider_name TEXT,
  last_login_at TEXT,
  UNIQUE (provider, provider_sub)
);

-- state ใช้ครั้งเดียว อายุ 10 นาที
CREATE TABLE oidc_states (
  nonce        TEXT PRIMARY KEY,
  state_hash   TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  scope        TEXT NOT NULL,
  expires_at   INTEGER NOT NULL, -- unix ms
  consumed_at  INTEGER
);

-- session ของแอปคุณ ไม่ใช่ของ DGA
CREATE TABLE sessions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id),
  token_hash         TEXT NOT NULL UNIQUE,
  provider_id_token  TEXT, -- เข้ารหัสแล้ว ใช้ตอน logout ที่ DGA
  expires_at         INTEGER NOT NULL,
  revoked_at         INTEGER
);
```

อย่าเก็บเลขบัตรลง log  
อย่าใส่เลขบัตรเต็มใน cookie หรือ JWT ที่ฝั่ง client อ่านได้  
ถ้าจะโชว์ใน UI ใช้แค่ `citizen_last4`

---

## 6. ลำดับทั้งระบบ (จำอันนี้)

```text
ผู้ใช้กดปุ่ม
  → เปิด /auth/dga
  → browser POST /api/auth/dga/authorize
      { redirectUri, scope }
  → server
      ตรวจ redirectUri ว่าอยู่ใน allowlist
      สร้าง state ที่เซ็นแล้ว + เก็บ nonce ใน SQLite
      คืน { authorizeUrl, state, expiresAt }
  → browser เก็บ state + redirectUri ใน sessionStorage
  → browser ไปที่ authorizeUrl (โดเมนของ DGA)

ผู้ใช้ล็อกอินที่ DGA
  → DGA พากลับ
      /auth/login-callback?code=...&state=...

หน้า callback
  → อ่าน code, state จาก URL
  → เทียบ state กับที่เก็บใน sessionStorage
  → POST /api/auth/dga/callback
      { code, state, redirectUri }   ← redirectUri ต้องตัวเดียวกับตอน authorize
  → server
      ตรวจลายเซ็น state
      ตรวจว่ายังไม่หมดอายุ และยังไม่ถูกใช้
      mark consumed ใน SQLite
      POST DGA /connect/token
      GET  DGA /connect/userinfo
      หาหรือสร้าง user ใน SQLite
      ออก session cookie ของแอป
  → ลบ query ออกจาก URL แล้วพาเข้าแอป
```

params จาก DGA มีแค่ `code` กับ `state`  
**ไม่มี** `mToken` และ **ไม่มี** `appId` ในเส้นนี้

---

## 7. สิ่งที่ต้องทำในโค้ด server (สำคัญสุด)

ไฟล์แนว `lib/dga-oidc.ts` ต้องเป็น server-only (`import 'server-only'`)

### 7.1 สร้าง authorize URL

```ts
const url = new URL("/connect/authorize", process.env.DGA_OIDC_BASE_URL);
url.searchParams.set("response_type", "code");
url.searchParams.set("client_id", process.env.DGA_OIDC_CLIENT_ID!);
url.searchParams.set("redirect_uri", redirectUri);
url.searchParams.set("scope", "openid citizen_id given_name family_name");
url.searchParams.set("state", signedState);
```

`scope` ที่อนุญาตมีแค่นี้: `openid`, `citizen_id`, `given_name`, `family_name`  
ต้องมี `openid` เสมอ

`redirectUri` ต้องอยู่ใน `DGA_OIDC_ALLOWED_REDIRECT_URIS` ไม่งั้นตอบ 400

### 7.2 เซ็นและตรวจ `state`

อย่าใช้ `Math.random()` หรือ state ที่ไม่ได้เซ็น

```ts
import { createHmac, randomUUID, timingSafeEqual, createHash } from "crypto";

type OidcState = {
  nonce: string;
  iat: number;
  exp: number; // Date.now() + 10 นาที
  redirectUri: string;
  scope: string;
};

function signState(payload: OidcState) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", process.env.DGA_OIDC_STATE_SECRET!)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifyState(state: string): OidcState {
  const [body, signature] = state.split(".");
  if (!body || !signature) throw new Error("Invalid state");
  const expected = createHmac("sha256", process.env.DGA_OIDC_STATE_SECRET!)
    .update(body)
    .digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid state");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OidcState;
  if (!payload.nonce || !payload.exp || payload.exp < Date.now()) {
    throw new Error("Expired state");
  }
  return payload;
}
```

ตอน authorize:

1. สร้าง `nonce = randomUUID()`
2. เซ็น state
3. เก็บแถวใน `oidc_states` (`nonce`, hash ของ state, redirectUri, scope, expiresAt)
4. ส่ง `state` กลับให้ browser

ตอน callback:

1. `verifyState(state)`
2. `redirectUri` ที่ส่งมาต้องเท่ากับใน state
3. อัปเดตแถวที่ `consumed_at IS NULL` และยังไม่หมดอายุ ให้ `consumed_at = now`
4. ถ้าอัปเดตได้ไม่ครบ 1 แถว = ใช้ซ้ำหรือของปลอม → 400
5. แล้วค่อยยิง DGA

เก็บ hash ของ state ไม่ต้องเก็บ state ทั้งก้อน

### 7.3 แลก `code` ที่ `/connect/token` — สูตรที่คนพลาดบ่อย

DGA **ไม่ได้** ใช้ HTTP Basic แบบ `client_id:client_secret` ตรง ๆ

ต้อง hash secret แบบนี้ก่อน แล้วค่อยเอามาต่อท้าย `client_id`:

```ts
import { createHash } from "crypto";

/** DGA consumer secret: md5(secret + "EGA") ซ้ำ 7 รอบ */
export function hashDgaConsumerSecret(secret: string) {
  let value = createHash("md5").update(`${secret}EGA`).digest("hex");
  for (let round = 1; round < 7; round++) {
    value = createHash("md5").update(`${value}EGA`).digest("hex");
  }
  return value;
}
```

แลก token:

```ts
const body = new URLSearchParams({
  grant_type: "authorization_code",
  code,
  redirect_uri: redirectUri, // ต้องตัวเดียวกับตอน authorize และที่ลงทะเบียน
});

const basic = Buffer.from(
  `${process.env.DGA_OIDC_CLIENT_ID}:${hashDgaConsumerSecret(process.env.DGA_OIDC_CLIENT_SECRET!)}`,
).toString("base64");

const tokenRes = await fetch(new URL("/connect/token", process.env.DGA_OIDC_BASE_URL), {
  method: "POST",
  headers: {
    Authorization: `basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body,
  signal: AbortSignal.timeout(10_000),
});
```

คำว่า `basic` ในโปรเจกต์ต้นทางใช้ตัวเล็กตามที่ DGA รับได้ อย่าลืมว่า header นี้ต้องมาจาก secret ที่ hash แล้ว

ได้ JSON ประมาณ:

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "id_token": "..."
}
```

ใช้ `access_token` เรียก UserInfo ทันที  
เก็บ `id_token` ฝั่งเซิร์ฟเวอร์แบบเข้ารหัส ไว้ logout  
`refresh_token` ของ DGA ไม่จำเป็นต้องเก็บถ้าแอปคุณออก session เอง

ถ้า `tokenRes` ไม่ ok ให้ตอบ 401 ว่า invalid authorization code  
อย่า log body ทั้งก้อน เพราะอาจมี token

### 7.4 ดึงตัวตนที่ `/connect/userinfo`

```ts
const infoRes = await fetch(new URL("/connect/userinfo", process.env.DGA_OIDC_BASE_URL), {
  headers: { Authorization: `Bearer ${accessToken}` },
  signal: AbortSignal.timeout(10_000),
});
```

ฟิลด์ที่ DGA ส่งมา และวิธี map:

| ของ DGA | ใช้เป็น |
| --- | --- |
| `czp_user` หรือถ้าไม่มีใช้ `sub` หรือ `citizen_id` | `provider_sub` (กุญแจผูกบัญชี) |
| `name` หรือ `given_name` + `family_name` | `full_name` |
| `citizen_id` | `citizen_id` |
| `email` | `email` |
| `phone_number` | `phone` |

ถ้าไม่มี `provider_sub` หรือไม่มีชื่อ → 401 อย่าสร้าง user ว่าง

`provider_sub` คือตัวตนถาวรของคนนั้น  
`code` และ `mToken` ไม่ใช่ตัวตนถาวร ห้ามใช้เป็น primary key

### 7.5 หาหรือสร้าง user ใน SQLite

ลำดับเดียวกับระบบต้นทางที่พิสูจน์แล้วว่าใช้ได้:

1. หา `auth_provider_links` ที่ `provider = 'tang_rat'` และ `provider_sub = sub`
   - มีแล้ว → login user นั้น อัปเดต `last_login_at`
   - ถ้า user ยังไม่มี `citizen_id` แต่รอบนี้ได้มา ให้เติมได้
2. ยังไม่เจอ link แต่มี `citizen_id` และมี user ที่เลขบัตรตรงกัน
   - สร้าง link ผูก sub นี้เข้า user เดิม แล้ว login
3. ไม่เจอทั้งสองแบบ
   - สร้าง `users` ใหม่ + สร้าง link แล้ว login

อย่าสร้าง user ซ้ำทุกครั้งที่ล็อกอิน

จากนั้นสร้างแถวใน `sessions` แล้วเซ็ต cookie เช่น:

```http
Set-Cookie: app_session=<random-opaque-token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

เก็บเฉพาะ hash ของ token ใน SQLite ไม่เก็บค่าดิบ  
อายุแนะนำ 7 วัน หรือตามที่โปรเจกต์ต้องการ

อย่าใส่ access token ของ DGA ลง cookie

---

## 8. สิ่งที่หน้าเว็บต้องทำ

หน้าเว็บไม่ถอดรหัสอะไรทั้งนั้น

### `/auth/dga`

1. `POST /api/auth/dga/authorize` พร้อม
   ```json
   {
     "redirectUri": "http://localhost:3000/auth/login-callback",
     "scope": "openid citizen_id given_name family_name"
   }
   ```
2. เก็บ `state` และ `redirectUri` ใน `sessionStorage`
3. `window.location.href = authorizeUrl`

อย่าสร้าง authorize URL เองใน browser เพราะต้องมี `client_id` และต้องเซ็น `state` ที่เซิร์ฟเวอร์

### `/auth/login-callback`

อ่าน `code` กับ `state` จาก query

ถ้าขาดอย่างใดอย่างหนึ่ง หรือ `state` ไม่ตรงกับ `sessionStorage` ให้หยุด แล้วให้เริ่ม login ใหม่

ถ้าตรง:

```ts
await fetch("/api/auth/dga/callback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code,
    state,
    redirectUri: sessionStorage.getItem("dga_oidc_redirect_uri"),
  }),
});
```

`redirectUri` ต้องเป็นสตริงเดียวกับตอน authorize ห้ามประกอบ URL ใหม่จาก `window.location.origin` ตอน callback เพราะอาจได้คนละค่ากับที่ลงทะเบียน

สำเร็จแล้วลบของใน `sessionStorage` และลบ query ด้วย `history.replaceState`

### `/auth/logout-callback`

แค่โชว์ว่าออกจากระบบแล้ว และมีปุ่มกลับหน้า login  
DGA พามาที่นี่หลัง `endsession` ไม่ต้องแลก token อีก

---

## 9. Logout

`POST /api/auth/logout` ทำฝั่งเซิร์ฟเวอร์ก่อนเสมอ:

1. หา session จาก cookie
2. revoke ใน SQLite
3. ลบ cookie ของแอป
4. ถ้า session นั้นมี `provider_id_token` ให้คืน URL นี้ด้วย

```text
{DGA_OIDC_BASE_URL}/connect/endsession
  ?id_token_hint=<id_token ถอดรหัสแล้ว>
  &post_logout_redirect_url=<DGA_OIDC_LOGOUT_REDIRECT_URI>
```

ชื่อพารามิเตอร์ของ DGA คือ `post_logout_redirect_url` ไม่ใช่ `post_logout_redirect_uri`

ฝั่งหน้าเว็บถ้าได้ `endSessionUrl` ให้ `window.location.href = endSessionUrl`  
ถ้าไม่มี ก็กลับ `/login` ได้เลย

อย่าส่ง `id_token` ให้ browser

---

## 10. โหมด mock ตอนยังไม่มี credential

ตั้ง `DGA_OIDC_MODE=mock`

authorize ยังสร้าง URL รูปทรงจริงได้ แต่ตอนแลก `code` ไม่ยิง DGA  
รับเฉพาะรหัสจำลองเหล่านี้หลังจากสร้าง state จริงจาก `/api/auth/dga/authorize`:

| code | ความหมายตัวอย่าง |
| --- | --- |
| `mock-dga-public-owner` | ประชาชน |
| `mock-dga-officer-diw` | เจ้าหน้าที่ตัวอย่าง |

หน้าเว็บยังต้องวิ่ง authorize → ได้ state → ค่อยยิง callback ด้วย mock code  
ห้ามเปิด callback ตรง ๆ โดยไม่มี state ในฐานข้อมูล

พอได้ `CLIENT_ID` / `CLIENT_SECRET` และโดเมนที่ DGA เข้าถึงได้ ค่อยสลับ `DGA_OIDC_MODE=real`

---

## 11. หลุมที่พบบ่อย

1. `redirect_uri` ไม่ตรงกัน 3 จุด: ตอนลงทะเบียน DGA, ตอน authorize, ตอนแลก token
2. ใช้ Basic auth แบบ `client_id:secret` ดิบ ไม่ได้ hash 7 รอบด้วยคำว่า `EGA`
3. ให้ browser ยิง `/connect/token` เอง แล้ว secret รั่ว
4. เปิด callback URL ซ้ำด้วย `code` เดิม — code ใช้ครั้งเดียว state ก็ใช้ครั้งเดียว
5. ลืมเก็บ nonce ใน SQLite ทำให้สอง instance หรือ refresh หน้าแล้วผ่านไม่ได้ / ผ่านซ้ำได้
6. สร้าง user ใหม่ทุก login เพราะใช้ `code` เป็นคีย์ แทน `provider_sub`
7. โชว์หรือ log เลขบัตรเต็ม
8. สับสนกับเส้น mToken แล้วไปรอ `mToken`/`appId` ใน callback ของ OIDC — จะไม่มี

---

## 12. Checklist ก่อนเทสกับ DGA จริง

- [ ] แอปลงทะเบียนที่ DGA แล้ว และ callback URL ตรงกับ env
- [ ] `DGA_OIDC_MODE=real`
- [ ] `CLIENT_ID` / `CLIENT_SECRET` อยู่แค่เซิร์ฟเวอร์
- [ ] hash secret 7 รอบก่อนใส่ Basic
- [ ] `state` เซ็น HMAC และ consume ใน SQLite ครั้งเดียว อายุ 10 นาที
- [ ] หน้า callback ส่ง `redirectUri` ชุดเดียวกับตอนเริ่ม
- [ ] UserInfo map `czp_user` → `provider_sub`
- [ ] session ของแอปเป็น httpOnly cookie
- [ ] ไม่มี secret ใน bundle ฝั่ง client
- [ ] localhost กับโดเมนจริงลงทะเบียนคนละ redirect URI

---

## 13. สิ่งที่ให้แชทปลายทางทำ

โปรเจกต์ปลายทางคือ Next.js fullstack + SQLite ไม่มี backend แยก

ให้ทำตามลำดับนี้:

1. สร้างตารางในหัวข้อ 5
2. เขียน `lib/dga-oidc.ts` ตามหัวข้อ 7 อย่าให้ client import ไฟล์นี้
3. เขียน `POST /api/auth/dga/authorize` และ `POST /api/auth/dga/callback`
4. เขียนหน้า `/auth/dga` และ `/auth/login-callback`
5. เทสโหมด mock ให้จบก่อน
6. ค่อยใส่ credential จริงแล้วเทส UAT บนโดเมนที่ DGA เรียกกลับได้

อย่าทำให้ซับซ้อนเกินนี้ในรอบแรก ไม่ต้องทำ mToken, ไม่ต้องทำ TOTP admin, ไม่ต้องทำ refresh token ของ DGA

สัญญาที่หน้าเว็บยิงมีแค่ 2 อัน:

```http
POST /api/auth/dga/authorize
{ "redirectUri": "http://localhost:3000/auth/login-callback",
  "scope": "openid citizen_id given_name family_name" }

→ { "authorizeUrl": "...", "state": "...", "expiresAt": "..." }

POST /api/auth/dga/callback
{ "code": "...", "state": "...", "redirectUri": "http://localhost:3000/auth/login-callback" }

→ Set-Cookie: app_session=...
  { "user": { "id": "...", "fullName": "..." } }
```

ถ้าทำครบนี้ ผู้ใช้กดปุ่มแล้วล็อกอินด้วยทางรัฐได้ โดย SQLite เป็นที่เก็บ user, state และ session ของแอป
