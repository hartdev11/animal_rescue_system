# Animal Rescue System — Graduation Project Documentation

> **โครงการจบการศึกษา (Final Year Project)**  
> ระบบช่วยเหลือสัตว์จรจัดที่บาดเจ็บ — Web Application

---

## สารบัญเอกสาร (17 Deliverables)

| # | เอกสาร | ไฟล์ |
|---|--------|------|
| 1 | Software Requirements Specification (SRS) | [01-SRS.md](./01-SRS.md) |
| 2 | Complete Sitemap | [02-SITEMAP.md](./02-SITEMAP.md) |
| 3 | Information Architecture | [03-INFORMATION-ARCHITECTURE.md](./03-INFORMATION-ARCHITECTURE.md) |
| 4 | User Flow Diagram | [04-USER-FLOWS.md](./04-USER-FLOWS.md) |
| 5 | Clinic Flow Diagram | [04-USER-FLOWS.md](./04-USER-FLOWS.md#clinic-flow) |
| 6 | Firestore Database Design | [05-DATABASE-DESIGN.md](./05-DATABASE-DESIGN.md) |
| 7 | ER Diagram | [05-DATABASE-DESIGN.md](./05-DATABASE-DESIGN.md#er-diagram) |
| 8 | Next.js Folder Structure | [06-PROJECT-STRUCTURE.md](./06-PROJECT-STRUCTURE.md) |
| 9 | Firebase Architecture | [07-FIREBASE-ARCHITECTURE.md](./07-FIREBASE-ARCHITECTURE.md) |
| 10 | Responsive Wireframes | [08-UI-DESIGN.md](./08-UI-DESIGN.md#wireframes) |
| 11 | High-Fidelity UI Design | [08-UI-DESIGN.md](./08-UI-DESIGN.md#high-fidelity) |
| 12 | Dashboard Design | [08-UI-DESIGN.md](./08-UI-DESIGN.md#dashboard) |
| 13 | Role-Based Access Control | [09-RBAC-SECURITY.md](./09-RBAC-SECURITY.md#rbac) |
| 14 | Security Design | [09-RBAC-SECURITY.md](./09-RBAC-SECURITY.md#security) |
| 15 | API Design | [10-API-DESIGN.md](./10-API-DESIGN.md) |
| 16 | Future Enhancement Plan | [11-FUTURE-ENHANCEMENTS.md](./11-FUTURE-ENHANCEMENTS.md) |
| 17 | Complete Graduation Project Documentation | เอกสารชุดนี้ทั้งหมด |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Firebase (Auth, Firestore, Storage) |
| Maps | Google Maps API, Browser Geolocation |
| Deployment | Vercel |

## Target Users

- **Citizen / Reporter** — รายงานสัตว์บาดเจ็บ (ไม่ต้อง Login)
- **Clinic** — คลินิกสัตวแพทย์ (Login จำเป็น)

## Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. คัดลอก environment variables
cp .env.example .env.local

# 3. กรอก Firebase และ Google Maps API keys ใน .env.local

# 4. รัน development server
npm run dev
```

## Project Status

| Phase | Status |
|-------|--------|
| Folder Structure | ✅ Complete |
| Type Definitions | ✅ Complete |
| Route Stubs | ✅ Complete |
| Firebase Config | ✅ Complete |
| Shadcn UI Base | ✅ Complete |
| Documentation | ✅ Complete |
| Firebase Integration | ⏳ Pending |
| Report Form | ⏳ Pending |
| Clinic Dashboard | ⏳ Pending |
| Adoption Module | ⏳ Pending |
