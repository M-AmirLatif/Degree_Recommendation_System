# 🎓 Next-Gen AI Degree & Career Recommendation System

**Project Code:** KHSIP-2026-MG-0004  
**Live Application:** [https://degree-recommendation-system-beta.vercel.app](https://degree-recommendation-system-beta.vercel.app)  
**Backend API & Docs:** [https://gray-chinchilla-564939.hostingersite.com/api/docs](https://gray-chinchilla-564939.hostingersite.com/api/docs)  

---

## 🌟 Overview

An enterprise-grade, full-stack SaaS platform designed to guide students across all academic tiers (**Matriculation, Intermediate FSc/ICS/I.Com/FA, 3-Year Technical DAE Diplomas, Cambridge O/A Levels, 2-Year Associate Degrees (ADP), 4-Year BS Degrees, and Master's Programs**) to their optimal educational and career pathways.

Powered by a **multi-factor weighted scoring algorithm**, **Gemini AI Career Counselor**, **real verified university admission and fee data across Pakistan**, and **146 accredited core curriculum courses**.

---

## 🚀 Key Industry-Standard Features

### 1. Multi-Tier Education Progression Support
- **Adaptive Grade Registration**: Dynamically configures inputs based on educational level (e.g. Matric, FSc, DAE, ADP, BS).
- **Flexible Scoring**: Automatically normalizes Board Marks (`e.g. 950/1100`), Percentages (`85%`), Cambridge Grades, and University CGPA (`0.0 - 4.0`).
- **34 Verified Degree Programs**: Full coverage from 2-year Inter/DAE to 4-5 Year BS (BSCS, BSAI, MBBS, BDS, BBA, LLB, Pharm-D, DPT, BArch, BSAF, etc.) and 2-year Master's/MBA.

### 2. 🏛️ Real-Time University Explorer & Admissions Directory
- Comprehensive directory of top universities across Pakistan (NUST, FAST, LUMS, KEMU, GIKI, UET, IBA, QAU, GCU, AIMC, PIEAS, etc.).
- Verified tuition fee ranges, HEC rankings, entry test requirements (*MDCAT, ECAT, NET, NU, LAT, GAT*), scholarship availability, and direct links to official admission portals.
- Interactive search with instant keyword/acronym matching (`KEMU`, `FAST`, `NUST`, `LUMS`, `PUCIT`) and location filters.

### 3. ✨ AI Career Counselor & Dynamic Multi-Year Roadmaps
- Integrated with Gemini AI (`gemini-1.5-flash`) + robust fallback engine.
- Generates tailored **2-Year, 3-Year, 4-Year, and 5-Year** semester-by-semester milestone roadmaps, skill suitability gap analyses, and actionable preparation checklists.

### 4. 📊 Side-by-Side Degree Comparator & Skill Radar Charts
- Compare up to 3 target degrees simultaneously.
- Interactive Chart.js radar charts visualizing Math, Analytical, Coding, Creative, and Communication skill requirements.
- Full attribute comparison matrix (Salary, Duration, Job Market, Subjects, Universities).

### 5. 📄 One-Click Branded PDF Career Report Export
- Generates high-resolution, printable student career scorecards with 1 click for students and parents.

### 6. 🛡️ Enterprise Security & Hardening
- JWT authentication with secure httpOnly cookie sessions and Bearer token fallback.
- Token-based self-service password recovery flow (`/auth/forgot-password` and `/auth/reset-password`).
- Rate limiting, Helmet security headers, HPP parameter pollution protection, Zod input validation, and full audit logging.
- OpenAPI 3.0 (Swagger) interactive API documentation at `/api/docs`.

### 7. ⚡ Ultra-Fast SWR & Parallel Performance Architecture
- Frontend parallel loading (`Promise.all`) eliminates network waterfalls.
- Stale-While-Revalidate (SWR) session caching renders pages **instantly (0ms)** on repeat visits.
- Backend in-memory caching (`Node-Cache`) yields sub-10ms response times for catalog endpoints.

---

## 📐 Recommendation Algorithm Logic

Degrees are evaluated using a multi-factor weighted scoring engine:

$$\text{Total Score} = 0.40 \cdot S_{\text{Academic}} + 0.30 \cdot S_{\text{Interests}} + 0.15 \cdot S_{\text{Skills}} + 0.10 \cdot S_{\text{Career}} + 0.05 \cdot S_{\text{Constraints}} + S_{\text{Feedback}}$$

- **Academic Background (40%)**: Stream compatibility, required subject overlap, strong subjects bonus, and minimum merit thresholds.
- **Interest Domains (30%)**: Alignment with student's chosen career fields.
- **Aptitude & Skills (15%)**: Problem-solving, analytical depth, and creative aptitude.
- **Career Goals (10%)**: Direct alignment with student's dream profession.
- **Feasibility & Constraints (5%)**: Budget feasibility, study location preference, and scholarship availability.
- **Feedback Reinforcement ($\pm 20$)**: Dynamic tuning based on user Like/Dislike interactions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, Modern CSS3 (Dark Theme Design System), JavaScript (ES6+), Chart.js |
| **Backend API** | Node.js, Express.js, Zod, Node-Cache, Compression, Helmet, Winston Logger |
| **Database** | MongoDB Atlas (Mongoose ODM with compound indexing) |
| **AI Integration** | Google Gemini AI API |
| **Documentation** | OpenAPI 3.0 / Swagger UI |
| **Deployments** | Frontend: Vercel • Backend: Hostinger Cloud • Database: MongoDB Atlas |

---

## 💻 Local Development Setup

### 1. Clone the repository:
```bash
git clone https://github.com/M-AmirLatif/Degree_Recommendation_System.git
cd Degree_Recommendation_System
```

### 2. Backend Setup:
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
API_RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=30
GEMINI_API_KEY=your_gemini_api_key_optional
```

### 3. Run Tests & Start Server:
```bash
# Run unit & integration tests (12 tests)
npm test

# Start development server
npm run dev
```

### 4. Open Frontend:
Serve `frontend/` using VS Code Live Server or any static HTTP server on port `5500`.

---

## 📋 Verification & Testing Status

- **Unit & Integration Test Suites**: 5 suites, 12 tests passing (`100% pass rate`).
- **Live Smoke Test Coverage**: Verified across Registration, Login, Dashboard, Recommendations, University Explorer, AI Counselor, Comparator, and Admin modules.
