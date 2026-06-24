# Animal Rescue System

ระบบช่วยเหลือสัตว์จรจัดที่บาดเจ็บ — Graduation Project Web Application

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Maps:** Google Maps API + Browser Geolocation
- **Deploy:** Vercel

## Firebase Setup (Gmail Login)

Gmail login requires Firebase. See **[docs/FIREBASE-SETUP.md](./docs/FIREBASE-SETUP.md)** or open `/docs/firebase-setup` in the app.

Quick steps:
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Google** in Authentication → Sign-in method
3. Copy config to `.env.local` (see `.env.example`)
4. Restart `npm run dev`

**โหมดไม่ระบุตัวตน** works without Firebase.

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in Firebase and Google Maps API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/           # Next.js routes (public + clinic portal)
├── components/    # UI components (shadcn + custom)
├── hooks/         # React hooks
├── lib/           # Firebase, utils, validations
├── services/      # Business logic
└── types/         # TypeScript types
```

## Documentation

Full graduation project documentation: [docs/README.md](./docs/README.md)

## Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page | Public |
| `/report` | Report injured animal | Public |
| `/case/[caseNumber]` | Track case | Public |
| `/adoption` | Browse adoptable animals | Public |
| `/clinic/login` | Clinic login | Public |
| `/clinic/dashboard` | Clinic dashboard | Clinic |
| `/clinic/cases` | Case management | Clinic |

## Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email + Google)
3. Create Firestore database
4. Enable Storage
5. Copy config to `.env.local`
6. Deploy rules: `npm run firebase:deploy-rules`

## License

Graduation Project — Educational Use
