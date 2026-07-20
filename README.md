# MediPredict — React Frontend

AI-powered disease prediction and doctor appointment system.  
Converted from a single-file vanilla HTML/JS app into a full **React + Vite + Tailwind CSS** project.

---

## 🗂 Project Structure

```
medipredict/
├── .env.example              ← copy to .env and set VITE_API_URL
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← Router + auth guards + ErrorBoundary
    ├── index.css             ← Tailwind base + custom utilities
    │
    ├── context/
    │   ├── AppContext.jsx    ← Global state, localStorage SDK, helpers
    │   └── AdminSeed.js      ← Seeds the default admin account
    │
    ├── data/
    │   └── constants.js      ← 100+ symptoms list, 26 disease rules
    │
    ├── utils/
    │   └── prediction.js     ← predictDisease(), confidenceLevel(), uid()
    │
    ├── services/
    │   └── api.js            ← Axios service layer (ready for Django backend)
    │
    ├── hooks/
    │   ├── useAuth.js        ← Auth convenience hook
    │   └── useForm.js        ← Form state + validation hook
    │
    ├── components/
    │   ├── NavBar.jsx        ← Patient / Doctor top navigation
    │   ├── Modal.jsx         ← Reusable modal dialog
    │   ├── Toast.jsx         ← Toast notification stack
    │   ├── FormFields.jsx    ← InputField, SelectField, TextareaField, PrimaryBtn
    │   ├── ErrorBoundary.jsx ← React error boundary
    │   ├── Spinner.jsx       ← Spinner, LoadingScreen, ButtonSpinner
    │   ├── StatCard.jsx      ← KPI stat tile
    │   └── Badges.jsx        ← ConfidenceBar, ConfidenceBadge, StatusBadge
    │
    └── pages/
        ├── RoleSelect.jsx
        ├── patient/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── SymptomChecker.jsx    ← live search + tag selection
        │   ├── PredictionResult.jsx  ← confidence bars + advice panels
        │   ├── DoctorList.jsx        ← book appointment + review modals
        │   ├── Appointments.jsx
        │   ├── History.jsx
        │   └── HealthProfile.jsx
        ├── doctor/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── Predictions.jsx       ← approve / reject / modify modal
        │   ├── Appointments.jsx      ← accept / reject / complete modal
        │   └── Schedule.jsx          ← calendar grid + upcoming list
        └── admin/
            ├── Login.jsx
            ├── AdminNavBar.jsx
            ├── Dashboard.jsx         ← platform-wide stats + recent activity
            ├── DoctorVerify.jsx      ← verify / reject doctors, filter tabs
            ├── Users.jsx             ← searchable user table
            ├── Predictions.jsx       ← all predictions with status filter
            └── Appointments.jsx      ← all appointments table
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 🔐 Demo Credentials

| Role    | Email                      | Password  |
|---------|----------------------------|-----------|
| Admin   | admin@medipredict.com      | admin123  |
| Patient | register via /patient/signup | —       |
| Doctor  | register via /doctor/signup  | —       |

> The admin account is **auto-seeded** on first load from `src/context/AdminSeed.js`.  
> All data is persisted in **localStorage** under the key `mp_records`.

---

## 🩺 Feature Overview

### Patient
| Page | Description |
|------|-------------|
| Sign Up / Login | JWT-ready auth forms with field validation |
| Dashboard | Stats (predictions, appointments, pending), quick-action cards |
| Symptom Checker | Live search dropdown, tag selection, min-2 symptom gate |
| Prediction Result | Top disease, confidence %, advice panel, other possibilities list |
| Doctor List | Verified doctors, book appointment modal, leave review modal |
| My Appointments | Status tracking (pending → accepted → completed), diagnosis/Rx view |
| Prediction History | All past predictions with confidence bars and doctor notes |
| Health Profile | Past diseases, allergies, lifestyle notes (used to improve predictions) |

### Doctor
| Page | Description |
|------|-------------|
| Sign Up / Login | Specialization, experience, license number |
| Dashboard | Pending predictions, pending appointments, completed count |
| Prediction Verification | Approve / Reject / Modify with notes modal |
| Appointment Management | Accept / Reject / Mark Complete with diagnosis + prescription modal |
| Schedule | Monthly calendar grid with appointment dots, upcoming sidebar |

### Admin
| Page | Description |
|------|-------------|
| Dashboard | Platform-wide stats grid, recent registrations, recent predictions |
| Doctor Verification | Filter by status, verify/reject with detail modal |
| All Users | Searchable + filterable user table |
| All Predictions | Status-filtered prediction log |
| All Appointments | Status-filtered appointment table |

---

## 🧠 Disease Prediction Engine

The prediction engine (`src/utils/prediction.js`) runs entirely **client-side** and is based on a rule-matching algorithm that mimics an ensemble ML approach:

```
For each disease rule:
  matched     = number of patient symptoms in the disease's known symptom list
  coverage    = matched / total disease symptoms
  relevance   = matched / total patient symptoms
  base_score  = disease rule base probability

  score = (coverage × 0.6) + (relevance × 0.2) + (base_score × 0.2)

Profile adjustments applied on top:
  - Age > 60   → +10% for heart / hypertension / diabetes / stroke / arthritis
  - BMI > 30   → +8%  for diabetes / hypertension / heart disease
  - Past diseases string matching → +12–15% for relevant conditions
  - score capped at 0.97
```

Returns the **top 5 ranked diseases** with confidence scores.

---

## 🔌 Connecting to the Django Backend

All API calls are defined in `src/services/api.js` using **Axios**.

1. Copy `.env.example` → `.env`
2. Set `VITE_API_URL=http://localhost:8000/api`
3. Replace the localStorage SDK in `AppContext.jsx` with real API calls:

```js
// Before (localStorage):
const res = sdk.create({ record_type: 'prediction', ... })

// After (Django REST):
import { predictionApi } from '../services/api.js'
const { data, error } = await predictionApi.predict({ symptoms, age, bmi, ... })
```

### Expected Django endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/patient/login/` | Returns `{ access, refresh, user }` |
| POST | `/api/auth/doctor/login/`  | Returns `{ access, refresh, user }` |
| POST | `/api/auth/patient/register/` | Patient registration |
| POST | `/api/auth/doctor/register/`  | Doctor registration |
| POST | `/api/predict/` | ML prediction service |
| GET  | `/api/predictions/` | Patient's own predictions |
| PATCH| `/api/predictions/:id/` | Doctor verify/modify |
| GET  | `/api/doctors/` | Verified doctors list |
| POST | `/api/appointments/` | Create appointment |
| GET  | `/api/appointments/` | Scoped appointments |
| PATCH| `/api/appointments/:id/` | Update appointment |
| POST | `/api/reviews/` | Submit review |
| GET  | `/api/admin/doctors/` | Admin: all doctors |
| PATCH| `/api/admin/doctors/:id/verify/` | Admin: verify doctor |

> Tokens are auto-injected via an Axios request interceptor.  
> Expired tokens trigger a silent refresh via `/api/auth/token/refresh/`.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Build Tool | Vite |
| State | React Context + localStorage |
| Fonts | DM Sans + Playfair Display (Google Fonts) |

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server (HMR)
npm run build    # Production build → dist/
npm run preview  # Serve dist/ locally
```

---

## 🗺 Roadmap / Next Steps

- [ ] Wire up Axios service layer to live Django backend
- [ ] Add JWT token refresh to AppContext
- [ ] Implement real ML model API call to `/api/predict/`
- [ ] Add file upload for doctor license certificate
- [ ] Add pagination to admin tables
- [ ] Add push notifications for appointment status changes
- [ ] Write unit tests with Vitest + React Testing Library
- [ ] Add PWA manifest for mobile install
