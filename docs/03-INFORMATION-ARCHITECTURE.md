# 3. Information Architecture

## 3.1 Content Hierarchy

```
Platform
├── Public Zone (ไม่ต้อง Login)
│   ├── Discovery
│   │   ├── Mission & Value Proposition
│   │   ├── How It Works (4 steps)
│   │   └── Platform Statistics
│   ├── Emergency Reporting
│   │   ├── Report Form
│   │   └── Submission Confirmation
│   ├── Case Transparency
│   │   ├── Current Status
│   │   ├── Event Timeline
│   │   └── Treatment Updates
│   └── Adoption Marketplace
│       ├── Animal Listings
│       └── Animal Profiles
│
└── Clinic Zone (Login Required)
    ├── Authentication
    ├── Operations Dashboard
    ├── Case Management
    │   ├── Case Queue (NEW)
    │   ├── Active Cases
    │   └── Case Detail Workspace
    └── Adoption Management
        ├── Recovered Animals
        └── Listing Editor
```

## 3.2 Navigation Model

### Public Header
- Logo → Home
- รับเลี้ยงสัตว์ → /adoption
- คลินิก → /clinic/login

### Clinic Sidebar
- แดชบอร์ด
- เคสทั้งหมด
- สัตว์รอรับเลี้ยง
- ออกจากระบบ

## 3.3 Content Types

| Content Type | Owner | Visibility |
|--------------|-------|------------|
| Rescue Case | System + Reporter | Public (limited PII) |
| Reporter Phone | Reporter | Clinic assigned case only |
| GPS Coordinates | Auto-captured | Clinic + map on case detail |
| Treatment Update | Clinic | Public on tracking page |
| Timeline Event | System/Clinic | Public on tracking page |
| Adoption Profile | Clinic | Public when AVAILABLE |

## 3.4 Labeling System

- **Case Number**: `CASE-{YEAR}-{SEQUENCE}` — primary tracking identifier
- **Status Labels**: bilingual EN/TH via `CASE_STATUS_LABELS`
- **Condition Types**: standardized enum (7 options)

## 3.5 Search & Findability

| User Need | Entry Point |
|-----------|-------------|
| Report emergency | Landing CTA, /report |
| Track my case | /case/[caseNumber] (from success page) |
| Find pet to adopt | /adoption |
| Manage cases | /clinic/login → dashboard |
