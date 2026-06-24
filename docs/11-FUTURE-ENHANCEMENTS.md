# 16. Future Enhancement Plan

## Phase 2 — Short Term (3-6 months)

| Feature | Description | Priority |
|---------|-------------|----------|
| Push Notifications | แจ้ง reporter เมื่อสถานะเปลี่ยน (SMS/LINE) | High |
| reCAPTCHA / App Check | ป้องกัน spam reports | High |
| Admin Panel | จัดการคลินิก, users, จังหวัด | High |
| Real-time Updates | Firestore onSnapshot สำหรับ tracking | Medium |
| Multi-image Upload | รองรับหลายรูปต่อเคส | Medium |
| Case Search | ค้นหาเคสด้วยเลขเคสในหน้าแรก | Medium |

## Phase 3 — Medium Term (6-12 months)

| Feature | Description |
|---------|-------------|
| Adoption Application Flow | ผู้สนใจรับเลี้ยงสมัครผ่านระบบ |
| Clinic Rating | ประชาชนให้คะแนนคลินิกหลังปิดเคส |
| Volunteer Network | อาสาสมัครช่วยขนส่งสัตว์ |
| Analytics Dashboard | รายงานสถิติรายเดือน/จังหวัด |
| LINE Official Account | รายงานผ่าน LINE Chatbot |
| Offline Support | PWA + cache สำหรับพื้นที่สัญญาณอ่อน |

## Phase 4 — Long Term (12+ months)

| Feature | Description |
|---------|-------------|
| Mobile App (React Native) | Native app สำหรับ reporter |
| AI Image Analysis | ประเมินความรุนแรงจากรูปอัตโนมัติ |
| Multi-country Support | ขยายออกนอกประเทศไทย |
| Integration with Govt | เชื่อมต่อหน่วยงานท้องถิ่น |
| Micro-donation | บริจาคค่ารักษาผ่านระบบ |
| Blockchain Transparency | บันทึก timeline ไม่เปลี่ยนแปลง |

## Technical Debt & Improvements

- Migrate counter logic to Cloud Functions
- Add comprehensive E2E tests (Playwright)
- Implement Firebase Admin SDK for all write operations
- Add i18n (EN/TH full support)
- Performance: image compression before upload
- Monitoring: Sentry + Firebase Performance

## Scalability Roadmap

```
MVP (Current)
  → Firebase Spark/Blaze
  → Single region
  → Manual clinic onboarding

Growth
  → Cloud Functions
  → CDN for images
  → Automated clinic registration

Scale
  → Multi-region Firestore
  → Dedicated admin team
  → API rate limiting + WAF
```
