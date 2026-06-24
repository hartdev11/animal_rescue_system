# 2. Complete Sitemap

```
Animal Rescue System (/)
│
├── 🏠 Landing Page (/)
│   ├── Hero Section
│   ├── Mission Statement
│   ├── How It Works
│   ├── Statistics
│   ├── CTA
│   ├── [Card] Report Injured Animal → /report
│   └── [Card] Clinic Portal → /clinic/login
│
├── 🚨 Report Flow (Public — No Auth)
│   ├── /report                    Report Form
│   └── /report/success            Success + Case Number + Tracking URL
│
├── 📍 Case Tracking (Public — No Auth)
│   └── /case/[caseNumber]         Status, Timeline, Updates, Images
│
├── 🐾 Adoption (Public)
│   ├── /adoption                  Browse available animals
│   └── /adoption/[id]             Animal detail
│
└── 🏥 Clinic Portal (Auth Required)
    ├── /clinic/login              Email + Google Sign-In
    ├── /clinic/dashboard          Statistics overview
    ├── /clinic/cases              All cases list
    ├── /clinic/cases/[id]         Case detail + actions
    ├── /clinic/animals            Adoption management list
    ├── /clinic/animals/new        Create adoption listing
    └── /clinic/animals/[id]       Edit adoption listing

API Routes (Server)
├── /api/cases                     POST create, GET list
├── /api/cases/[id]                GET detail, PATCH update
├── /api/adoption                  GET public listing
└── /api/statistics                GET platform stats
```

## URL Conventions

| Pattern | Example | Access |
|---------|---------|--------|
| Public pages | `/`, `/report`, `/adoption` | Everyone |
| Tracking | `/case/CASE-2026-000001` | Everyone with case number |
| Clinic | `/clinic/*` | Authenticated clinic staff |
