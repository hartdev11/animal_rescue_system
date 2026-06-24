# 1. Software Requirements Specification (SRS)

## 1.1 Introduction

### 1.1.1 Purpose
เอกสารนี้กำหนดความต้องการของระบบ **Animal Rescue System** — แพลตฟอร์มเว็บสำหรับรายงานและจัดการเคสสัตว์จรจัดที่บาดเจ็บในกรณีฉุกเฉิน

### 1.1.2 Scope
ระบบรองรับเฉพาะกรณี **สัตว์จรจัดที่บาดเจ็บหรือฉุกเฉิน** ไม่รองรับการรายงานสัตว์จรจัดทั่วไป

### 1.1.3 Definitions

| Term | Definition |
|------|------------|
| Reporter | ประชาชนที่พบและรายงานสัตว์บาดเจ็บ |
| Clinic | คลินิกสัตวแพทย์ที่รับผิดชอบเคสในจังหวัด |
| Case | เคสช่วยเหลือสัตว์ 1 รายการ |
| Case Number | รหัสติดตาม เช่น CASE-2026-000001 |

---

## 1.2 Overall Description

### 1.2.1 Product Perspective
Web Application แบบ Full Stack ใช้ Next.js + Firebase บน Vercel

### 1.2.2 User Classes

| Role | Authentication | Primary Goals |
|------|----------------|---------------|
| Reporter | ไม่ต้อง Login | รายงานเร็ว, ติดตามเคส |
| Clinic Staff | Email/Google Login | รับเคส, อัปเดตสถานะ, จัดการรักษา |

### 1.2.3 Operating Environment
- Browser: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Device: Mobile-first, responsive tablet/desktop
- Network: ต้องการ GPS และการอัปโหลดรูปภาพ

---

## 1.3 Functional Requirements

### FR-01: Landing Page
- แสดง Hero, Mission, How It Works, Statistics, CTA
- การ์ด 2 ใบหลัก: Report Injured Animal / Clinic Portal

### FR-02: Report Animal (No Login)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-02.1 | อัปโหลดรูปสัตว์ (required) | Must |
| FR-02.2 | กรอกเบอร์โทร (required) | Must |
| FR-02.3 | เลือกอาการจากรายการ | Must |
| FR-02.4 | กรอกคำอธิบาย | Must |
| FR-02.5 | ดึง GPS อัตโนมัติ | Must |
| FR-02.6 | ระบุจังหวัดอัตโนมัติ + แก้ไขได้ | Must |
| FR-02.7 | สร้าง Case Number | Must |
| FR-02.8 | แสดง Tracking URL | Must |

### FR-03: Case Assignment
- มอบหมายเคสให้คลินิกตามจังหวัด (province-based routing)

### FR-04: Case Tracking (Public)
- ติดตามด้วย Case Number โดยไม่ต้อง Login
- แสดง: Status, Timeline, Treatment Updates, Images

### FR-05: Clinic Authentication
- Email + Password
- Google Sign-In

### FR-06: Clinic Dashboard
- สถิติตามสถานะ: New, Accepted, On The Way, Under Treatment, Recovery, Ready For Adoption, Closed

### FR-07: Case Management
- ดูรายการเคสใหม่
- Accept Case
- เปลี่ยนสถานะตาม workflow
- อัปโหลดรูปความคืบหน้า
- เพิ่ม Medical Notes

### FR-08: Adoption Module
- ลงทะเบียนสัตว์ที่ฟื้นตัวแล้ว
- สถานะ: AVAILABLE, PENDING, ADOPTED
- หน้าสาธารณะสำหรับ browse สัตว์รอรับเลี้ยง

---

## 1.4 Case Status Workflow

```
NEW → ACCEPTED → ON_THE_WAY → RESCUED → UNDER_TREATMENT
  → RECOVERY → READY_FOR_ADOPTION → ADOPTED → CLOSED
```

---

## 1.5 Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | หน้า Report โหลด < 3 วินาทีบน 4G |
| NFR-02 | Usability | รายงานเคสได้ภายใน 2 นาที |
| NFR-03 | Security | Clinic data protected; phone visible to assigned clinic only |
| NFR-04 | Availability | 99% uptime (Vercel + Firebase SLA) |
| NFR-05 | Scalability | รองรับหลายจังหวัด/หลายคลินิก |
| NFR-06 | Responsive | Mobile-first design |

---

## 1.6 Constraints
- Firebase free tier limits
- Google Maps API billing
- Reporter ไม่มี account — tracking ผ่าน Case Number เท่านั้น
