# 4 & 5. User Flow & Clinic Flow Diagrams

## 4. Reporter User Flow

```mermaid
flowchart TD
    A[เข้าเว็บไซต์] --> B[Landing Page]
    B --> C{เลือกการกระทำ}
    C -->|รายงานสัตว์บาดเจ็บ| D[/report]
    C -->|รับเลี้ยงสัตว์| E[/adoption]
    C -->|คลินิก| F[/clinic/login]

    D --> G[กรอกฟอร์ม]
    G --> G1[อัปโหลดรูป]
    G --> G2[กรอกเบอร์โทร]
    G --> G3[เลือกอาการ]
    G --> G4[อธิบายสถานการณ์]
    G --> G5[GPS Auto-detect]
    G --> G6[จังหวัด Auto/Manual]

    G --> H[Submit Case]
    H --> I[ระบบสร้าง Case Number]
    I --> J[มอบหมายคลินิกตามจังหวัด]
    J --> K[/report/success]
    K --> L[ได้ Tracking URL]
    L --> M[/case/CASE-XXXX]
    M --> N[ดู Status + Timeline + Updates]
```

## 5. Clinic Flow {#clinic-flow}

```mermaid
flowchart TD
    A[Clinic Staff] --> B[/clinic/login]
    B --> C{Auth}
    C -->|Email/Google| D[Dashboard]
    C -->|Fail| B

    D --> E[ดูสถิติเคส]
    D --> F[/clinic/cases]

    F --> G{เคสใหม่?}
    G -->|Yes| H[/clinic/cases/id]
    H --> I[Review: รูป, GPS, เบอร์โทร, อาการ]
    I --> J[Accept Case]
    J --> K[Status: ACCEPTED]

    K --> L[Update Status Flow]
    L --> L1[ON_THE_WAY]
    L1 --> L2[RESCUED]
    L2 --> L3[UNDER_TREATMENT]
    L3 --> L4[Upload Progress + Notes]
    L4 --> L5[RECOVERY]
    L5 --> L6[READY_FOR_ADOPTION]

    L6 --> M[/clinic/animals/new]
    M --> N[สร้าง Adoption Profile]
    N --> O[ADOPTED → CLOSED]

    G -->|Active Case| H
```

## Status Transition Rules

| From | Allowed Next |
|------|--------------|
| NEW | ACCEPTED |
| ACCEPTED | ON_THE_WAY |
| ON_THE_WAY | RESCUED |
| RESCUED | UNDER_TREATMENT |
| UNDER_TREATMENT | RECOVERY |
| RECOVERY | READY_FOR_ADOPTION |
| READY_FOR_ADOPTION | ADOPTED |
| ADOPTED | CLOSED |
