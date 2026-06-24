# ตั้งค่า Firebase + Gmail Login

คู่มือนี้ใช้สำหรับเปิดใช้ **เข้าสู่ระบบด้วย Gmail** ใน Animal Rescue System

---

## ขั้นตอนที่ 1 — สร้าง Firebase Project

1. เปิด [Firebase Console](https://console.firebase.google.com/)
2. กด **Add project** (หรือใช้โปรเจกต์ที่มีอยู่)
3. ตั้งชื่อโปรเจกต์ เช่น `animal-rescue-system`
4. ปิด/เปิด Google Analytics ตามต้องการ → **Create project**

---

## ขั้นตอนที่ 2 — สร้าง Web App

1. ในหน้า Project Overview กดไอคอน **Web** `</>`
2. ตั้งชื่อ app เช่น `animal-rescue-web`
3. **ไม่ต้อง** ติ๊ก Firebase Hosting (ใช้ Vercel แทน)
4. กด **Register app**
5. คัดลอกค่า `firebaseConfig` ที่แสดง

---

## ขั้นตอนที่ 3 — เปิด Authentication

1. เมนูซ้าย → **Build** → **Authentication**
2. กด **Get started**
3. แท็บ **Sign-in method**
4. เปิด **Google** → เปิด Enable → เลือก Support email → **Save**
5. (ถ้าต้องการคลินิกใช้ Email) เปิด **Email/Password** ด้วย

---

## ขั้นตอนที่ 4 — ตั้งค่า Authorized domains

1. ใน Authentication → **Settings** → **Authorized domains**
2. ตรวจสอบว่ามี:
   - `localhost`
   - โดเมน production ของคุณ (เช่น `your-app.vercel.app`)

---

## ขั้นตอนที่ 5 — สร้างไฟล์ `.env.local`

ที่ root โปรเจกต์ (`animal-rescue-system/`) สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

คัดลอกค่าจาก Firebase Console → Project settings → **Your apps** → Web app

---

## ขั้นตอนที่ 6 — รีสตาร์ท Dev Server

```bash
# กด Ctrl+C หยุด server ก่อน
npm run dev
```

เปิด `http://localhost:3000` → เลือก User → **เข้าสู่ระบบด้วย Gmail**

---

## ขั้นตอนที่ 7 — เปิด Firestore + Storage

1. Firebase Console → **Build** → **Firestore Database** → **Create database** (โหมด Production)
2. Firebase Console → **Build** → **Storage** → **Get started**
3. ดาวน์โหลด **Service account** key:
   - Project settings → **Service accounts** → **Generate new private key**
   - วางไฟล์ JSON ในโปรเจกต์ แล้วตั้ง path ใน `.env.local`:
     ```env
     FIREBASE_SERVICE_ACCOUNT_PATH=src/app/your-firebase-adminsdk.json
     ```

---

## ขั้นตอนที่ 8 — Deploy Rules + Indexes

```bash
npm run firebase:deploy-rules
```

(ต้อง login `firebase login` และ `firebase use your-project-id` ก่อน)

---

## ขั้นตอนที่ 9 — ย้ายข้อมูลเดิม (ถ้ามีไฟล์เก่า)

ถ้ามีเคสเก่าจากช่วง dev ที่เก็บในไฟล์ local (`.data/cases.json`) ก่อนเปิด Firebase:

```bash
npm run migrate:firebase
```

สคริปต์นี้เป็นเครื่องมือย้ายข้อมูลครั้งเดียว — แอปใช้งานจริงเก็บข้อมูลใน Firestore เท่านั้น

---

## แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|--------|---------|
| `auth/invalid-api-key` | ตรวจสอบ `NEXT_PUBLIC_FIREBASE_API_KEY` ใน `.env.local` |
| Popup ถูกบล็อก | อนุญาต popup ในเบราว์เซอร์ |
| `auth/unauthorized-domain` | เพิ่ม domain ใน Authorized domains |
| กด Gmail แล้วไม่มีอะไรเกิดขึ้น | รีสตาร์ท `npm run dev` หลังสร้าง `.env.local` |
| `unable to verify the first certificate` | ตั้ง `FIREBASE_ALLOW_INSECURE_TLS=true` ใน `.env.local` (dev เท่านั้น) หรือปิด VPN/antivirus SSL scan |
| ใช้ IP แทน localhost | Gmail login ใช้ `localhost` ได้ดีกว่า |

---

## หมายเหตุ

- **โหมดไม่ระบุตัวตน** ใช้งานได้ทันทีโดยไม่ต้อง Firebase
- Gmail login ต้องการ Firebase เท่านั้น
- อย่า commit ไฟล์ `.env.local` ขึ้น Git
