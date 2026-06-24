# 8. Next.js Folder Structure

```
animal-rescue-system/
├── docs/                          # Graduation project documentation
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Tailwind + Shadcn theme
│   │   ├── not-found.tsx
│   │   │
│   │   ├── report/                # Public report flow
│   │   │   ├── page.tsx
│   │   │   └── success/page.tsx
│   │   │
│   │   ├── case/                  # Public tracking
│   │   │   └── [caseNumber]/page.tsx
│   │   │
│   │   ├── adoption/              # Public adoption
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── clinic/                # Clinic portal (auth)
│   │   │   ├── layout.tsx         # Sidebar + auth guard
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── animals/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/page.tsx
│   │   │
│   │   └── api/                   # API routes
│   │       ├── cases/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── adoption/route.ts
│   │       └── statistics/route.ts
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn UI primitives
│   │   ├── layout/                # Header, Footer, PublicLayout
│   │   ├── landing/               # Landing page sections
│   │   ├── report/                # Report form components
│   │   ├── tracking/                # Case tracking components
│   │   ├── clinic/                  # Clinic-specific components
│   │   ├── adoption/                # Adoption cards
│   │   └── maps/                    # Google Maps components
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-geolocation.ts
│   │
│   ├── lib/
│   │   ├── firebase/              # Firebase SDK setup
│   │   ├── validations/           # Zod schemas
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   ├── services/                    # Business logic / Firestore ops
│   │   ├── case-service.ts
│   │   ├── clinic-service.ts
│   │   └── adoption-service.ts
│   │
│   └── types/
│       └── index.ts                 # TypeScript interfaces
│
├── firebase.json                    # Firebase project config
├── firestore.rules                  # Security rules
├── firestore.indexes.json           # Composite indexes
├── storage.rules                    # Storage security rules
├── components.json                  # Shadcn UI config
├── .env.example                     # Environment template
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| `app/` | Routes, pages, API endpoints |
| `components/` | UI presentation |
| `hooks/` | Client-side React hooks |
| `lib/` | Config, utils, validations |
| `services/` | Data access & business logic |
| `types/` | Shared TypeScript types |
