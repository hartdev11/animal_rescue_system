# 13 & 14. Role-Based Access Control & Security Design

## 13. RBAC Model {#rbac}

### Roles

| Role | Auth | Permissions |
|------|------|-------------|
| **Reporter** (anonymous) | None | Create case, view own case by caseNumber, browse adoption |
| **Clinic Staff** | Firebase Auth | Manage assigned clinic cases, upload updates, manage animals |
| **Admin** (future) | Firebase Auth | Manage clinics, users, platform config |

### Permission Matrix

| Resource | Reporter | Clinic | Admin |
|----------|----------|--------|-------|
| Create case | ✅ | ❌ | ✅ |
| Read case (public fields) | ✅ (by caseNumber) | ✅ (own clinic) | ✅ |
| Read reporter phone | ❌ | ✅ (assigned case) | ✅ |
| Update case status | ❌ | ✅ (own clinic) | ✅ |
| Create case update | ❌ | ✅ | ✅ |
| Read case updates | ✅ | ✅ | ✅ |
| Create animal listing | ❌ | ✅ | ✅ |
| Read animals (AVAILABLE) | ✅ | ✅ | ✅ |
| Update animal | ❌ | ✅ (own) | ✅ |
| Clinic profile | ❌ | Read own | ✅ |

### Implementation

```
Firebase Auth UID
  → users/{uid}.role
  → users/{uid}.clinicId
  → Firestore Rules validate clinicId match on writes
```

---

## 14. Security Design {#security}

### 14.1 Authentication Security

| Measure | Implementation |
|---------|----------------|
| Clinic-only auth | Firebase Auth with email verification (recommended) |
| Google OAuth | Firebase Google provider |
| Session management | Firebase client SDK + onAuthStateChanged |
| Route protection | Clinic layout checks auth state client-side + rules server-side |

### 14.2 Data Security

| Data | Protection |
|------|------------|
| Reporter phone | Visible only to assigned clinic in UI; public rules allow read on case (consider tightening in production) |
| GPS coordinates | Public on tracking (needed for transparency); clinic sees on detail |
| Clinic credentials | Firebase Auth (hashed, managed by Google) |
| Images | Storage rules: public read, controlled write |

### 14.3 Firestore Security Rules Strategy

```
cases:
  - create: allow all (reporter emergency reporting)
  - read: allow all (tracking by case number)
  - update: clinic only, must own clinicId

caseUpdates / caseTimeline:
  - create: clinic only
  - read: public

animals:
  - read: public
  - write: clinic only

counters:
  - deny all client access (use Admin SDK / Cloud Functions)
```

### 14.4 Input Validation

| Layer | Tool |
|-------|------|
| Client | Zod + React Hook Form |
| Server | Zod in API routes |
| Database | Firestore rules type checks |

### 14.5 Abuse Prevention

| Threat | Mitigation |
|--------|------------|
| Spam reports | Rate limiting on API (Vercel middleware) |
| Fake images | File type + size validation |
| Bot submissions | reCAPTCHA / Firebase App Check (future) |
| Case number enumeration | Long sequential numbers; no sensitive PII in response |

### 14.6 Transport & Headers

- HTTPS enforced (Vercel default)
- Environment secrets in `.env.local` (never committed)
- `NEXT_PUBLIC_*` only for client-safe keys

### 14.7 Privacy Considerations (PDPA)

- Reporter phone collected with clear purpose (rescue coordination)
- No reporter name/email required
- Data retention policy: cases archived after CLOSED (future)
- Clinic access logged via `createdBy` on updates
