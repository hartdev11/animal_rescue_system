# 15. API Design

## Overview

Next.js API Routes serve as a thin server layer for operations requiring validation, Firebase Admin SDK, or rate limiting.

Base URL: `{APP_URL}/api`

---

## Endpoints

### POST `/api/cases`

Create a new rescue case (reporter, no auth).

**Request:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| image | File | Yes |
| phoneNumber | string | Yes |
| condition | AnimalCondition | Yes |
| description | string | Yes |
| latitude | number | Yes |
| longitude | number | Yes |
| province | string | Yes |

**Response:** `201 Created`

```json
{
  "caseNumber": "CASE-2026-000001",
  "trackingUrl": "/case/CASE-2026-000001",
  "clinicId": "clinic_saraburi_01"
}
```

**Errors:**
- `400` — Validation failed
- `429` — Rate limited
- `500` — Server error

---

### GET `/api/cases`

List cases (clinic auth required).

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| status | CaseStatus | Filter by status |
| clinicId | string | Auto from auth token |

**Response:** `200 OK`

```json
{
  "cases": [
    {
      "id": "abc123",
      "caseNumber": "CASE-2026-000001",
      "condition": "HIT_BY_VEHICLE",
      "province": "สระบุรี",
      "status": "NEW",
      "imageUrl": "https://...",
      "createdAt": "2026-06-18T10:30:00Z"
    }
  ]
}
```

---

### GET `/api/cases/[id]`

Get case detail.

**Auth:** Public (limited fields) or Clinic (full fields including phone)

**Response:** `200 OK`

```json
{
  "id": "abc123",
  "caseNumber": "CASE-2026-000001",
  "phoneNumber": "0812345678",
  "condition": "HIT_BY_VEHICLE",
  "description": "พบหมาขาหักริมถนน",
  "imageUrl": "https://...",
  "latitude": 14.5286,
  "longitude": 100.9103,
  "province": "สระบุรี",
  "status": "UNDER_TREATMENT",
  "timeline": [],
  "updates": []
}
```

---

### PATCH `/api/cases/[id]`

Update case (clinic auth required).

**Request Body:**

```json
{
  "status": "ACCEPTED",
  "note": "รับเคสแล้ว กำลังเตรียมออกไปช่วยเหลือ"
}
```

**Response:** `200 OK`

---

### POST `/api/cases/[id]/updates`

Add treatment update with optional image (clinic auth).

**Request:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| note | string | Yes |
| image | File | No |

---

### GET `/api/adoption`

Public adoption listing.

**Query:** `?status=AVAILABLE`

**Response:**

```json
{
  "animals": [
    {
      "id": "animal01",
      "name": "บัดดี้",
      "gender": "MALE",
      "estimatedAge": "2 ปี",
      "description": "ขี้อ้อน ชอบเล่น",
      "imageUrls": ["https://..."],
      "adoptionStatus": "AVAILABLE"
    }
  ]
}
```

---

### GET `/api/statistics`

Platform-wide statistics for landing page.

**Response:**

```json
{
  "totalCases": 150,
  "animalsRescued": 120,
  "animalsRecovered": 95,
  "animalsAdopted": 42
}
```

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "เบอร์โทรศัพท์ไม่ถูกต้อง",
    "details": [{ "field": "phoneNumber", "message": "..." }]
  }
}
```

## Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation |
| 401 | Unauthorized |
| 403 | Forbidden (wrong clinic) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Internal error |
