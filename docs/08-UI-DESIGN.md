# 10, 11 & 12. UI Design — Wireframes, High-Fidelity & Dashboard

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | Emerald `#059669` | CTA, clinic branding |
| Emergency | Red `#DC2626` | Report actions |
| Background | White / Gray-50 | Page backgrounds |
| Font | Geist Sans | Body text |
| Radius | 0.625rem | Cards, buttons |
| Component Library | Shadcn UI (New York) | All UI primitives |

---

## 10. Responsive Wireframes {#wireframes}

### Landing Page (Mobile)

```
┌─────────────────────────┐
│ 🐾 Animal Rescue System │
│        [คลินิก]         │
├─────────────────────────┤
│                         │
│  ช่วยเหลือสัตว์จรจัด     │
│     ที่บาดเจ็บ          │
│                         │
│  [subtitle text]        │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🚨 รายงานสัตว์บาดเจ็บ │ │
│ │ ไม่ต้องสมัครสมาชิก   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🏥 พอร์ทัลคลินิก     │ │
│ │ เข้าสู่ระบบคลินิก    │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│   วิธีการใช้งาน (1-4)    │
├─────────────────────────┤
│   สถิติ (4 ตัวเลข)       │
├─────────────────────────┤
│   [รายงานตอนนี้]         │
└─────────────────────────┘
```

### Report Form (Mobile)

```
┌─────────────────────────┐
│ ← รายงานสัตว์บาดเจ็บ     │
├─────────────────────────┤
│ [📷 อัปโหลดรูปสัตว์ *]   │
│                         │
│ เบอร์โทรศัพท์ *          │
│ [________________]      │
│                         │
│ อาการ *                  │
│ [▼ เลือกอาการ]          │
│                         │
│ รายละเอียด *             │
│ [________________]      │
│ [________________]      │
│                         │
│ 📍 ตำแหน่ง GPS          │
│ [แผนที่ + พิกัด]        │
│                         │
│ จังหวัด *                │
│ [▼ สระบุรี]             │
│                         │
│ [  ส่งรายงาน  ]          │
└─────────────────────────┘
```

### Case Tracking (Mobile)

```
┌─────────────────────────┐
│ ติดตามเคส               │
│ CASE-2026-000001        │
├─────────────────────────┤
│ สถานะ: กำลังรักษา       │
│ ████████░░ 60%          │
├─────────────────────────┤
│ Timeline                │
│ ● 18 Jun - ส่งเคส       │
│ ● 18 Jun - รับเคส       │
│ ● 18 Jun - ช่วยเหลือแล้ว │
│ ● 19 Jun - ผ่าตัดเสร็จ   │
├─────────────────────────┤
│ อัปเดตการรักษา          │
│ [รูป] Surgery completed │
│ [รูป] ฟื้นตัวดีขึ้น      │
└─────────────────────────┘
```

---

## 11. High-Fidelity UI Design {#high-fidelity}

### Color Application

| Page | Dominant | Accent |
|------|----------|--------|
| Landing | Emerald gradient hero | Red report card border |
| Report | White form card | Red submit button |
| Tracking | White + status badge colors | Emerald progress |
| Adoption | Warm neutral cards | Emerald "ดูรายละเอียด" |
| Clinic Login | Centered white card | Emerald logo |
| Clinic Dashboard | Gray sidebar + white content | Status-colored stat cards |

### Component Specs

- **Action Cards**: `rounded-2xl`, `shadow-lg`, `border-2`, hover elevation
- **Buttons**: Shadcn `Button` — primary emerald, destructive red for emergency
- **Forms**: Shadcn `Input`, `Select`, `Textarea`, `Label` with validation messages
- **Status Badges**: Color-coded per `CaseStatus` enum
- **Timeline**: Vertical line with filled dots, date + title + optional description

### Typography Scale

| Element | Size | Weight |
|---------|------|--------|
| H1 (Hero) | 36-48px | Bold |
| H2 (Section) | 24-30px | Bold |
| Body | 16px | Regular |
| Caption | 14px | Medium |
| Case Number | 24px | Mono Bold |

---

## 12. Dashboard Design {#dashboard}

### Clinic Dashboard Layout (Desktop)

```
┌──────────┬──────────────────────────────────────────┐
│ 🏥 ARS   │  แดชบอร์ด              [ออกจากระบบ]    │
│          ├──────────────────────────────────────────┤
│ แดชบอร์ด  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│ เคสทั้งหมด│  │ 5  │ │ 3  │ │ 2  │ │ 8  │          │
│ สัตว์รอรับ │  │New │ │Acc │ │Way │ │Treat│         │
│          │  └────┘ └────┘ └────┘ └────┘          │
│          │  ┌────┐ ┌────┐ ┌────┐                  │
│          │  │ 4  │ │ 2  │ │ 15 │                  │
│          │  │Rec │ │Adopt│ │Closed│                │
│          │  └────┘ └────┘ └────┘                  │
│          │                                          │
│          │  เคสล่าสุด                               │
│          │  ┌────────────────────────────────────┐  │
│          │  │ CASE-2026-000042 | สระบุรี | NEW  │  │
│          │  │ CASE-2026-000041 | สระบุรี | ACC  │  │
│          │  └────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────┘
```

### Case Detail (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ CASE-2026-000001          [รับเคส] [อัปเดตสถานะ]    │
├──────────────────────┬──────────────────────────────┤
│ [Animal Photo]       │  [Google Map]                │
│                      │  Lat: 14.528, Lng: 100.910  │
│ อาการ: ถูกรถชน       │                              │
│ จังหวัด: สระบุรี      │                              │
│ เบอร์: 081-xxx-xxxx  │                              │
│ รายละเอียด: ...      │                              │
├──────────────────────┴──────────────────────────────┤
│ Timeline                                            │
│ ● ─── ● ─── ● ─── ○ ─── ○                         │
├─────────────────────────────────────────────────────┤
│ อัปเดตการรักษา  [+ เพิ่มบันทึก] [📷 อัปโหลดรูป]      │
│ ┌─────────┐ Surgery completed successfully          │
│ │  img    │ 19 Jun 2026                           │
│ └─────────┘                                         │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Single column, stacked cards |
| 640-1024px | 2-column grids |
| > 1024px | Sidebar + main, 4-column stats |
