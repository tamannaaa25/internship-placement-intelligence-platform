# 🎓 Campus Placement & Internship Intelligence Platform

An enterprise-grade, dual-pillar software engineering and data analytics platform designed to solve campus placement transparency, student application pipeline management, and career readiness diagnostics.

```text
                    Internship & Placement Platform
                              │
                 ┌────────────┴────────────┐
                 │                         │
          Full-Stack Application      Data Analytics
                 │                         │
             MongoDB                     MySQL
                 │                         │
        React + Node.js             SQL + Python
        Express + JWT               Excel + Tableau
        Gemini API
```

---

## 🌟 Executive Summary

The platform is structured into two core pillars with a strict two-database separation:

1. **Full-Stack Operational Web Application (`MongoDB + Mongoose`)**:
   - **Personal Application Tracker**: Multi-stage CRM for tracking applications from Applied &rarr; OA &rarr; Interview Rounds &rarr; Offer/Rejection.
   - **AI-Powered Resume ↔ JD Skill Gap Analyzer**: In-memory PDF resume text extraction paired with the Google Gemini LLM to compute 0–100 ATS scores, detect matched/missing competencies, and generate personalized learning roadmaps.
   - **Personal Funnel Dashboard**: Tracks individual conversion rates (OA conversion, Interview-to-Offer ratios, domain distributions).

2. **Campus Placement & Internship Intelligence Suite (`MySQL + SQL`)**:
   - **Analytical Cohort Warehouse**: Ingests 825 raw student records with real-world data quality issues into MySQL `raw_placement_records`, cleans them into 800 validated records in `placement_records` via SQL window functions (`ROW_NUMBER()`) and `CASE WHEN` department standardization.
   - **Macro Institutional Analytics**: Evaluates cohort benchmarks, year-over-year trends, academic tier impacts, recruiter hiring volumes, and calculates the quantitative placement advantage of prior internship experience (+34.17 percentage points).
   - **Multi-Tool Deliverables**: Backed by pure Java 17 Streams descriptive engine, Python/Pandas EDA, interactive Tableau workbook, and dynamic Excel reports.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)**, React 19, Tailwind CSS 4, Chart.js | Modern, responsive dark UI, client-side dynamic filtering, interactive visualizations |
| **Backend API** | **Node.js, Express.js** | Decoupled modular RESTful API architecture (Routes &rarr; Controllers &rarr; Services &rarr; Repositories) |
| **Operational DB** | **MongoDB & Mongoose** | Real-time user auth, student profiles, internships, placements, resumes, and application tracking |
| **Analytics DB** | **MySQL (SQL Engine)** | Analytical warehouse staging (`raw_placement_records` & `placement_records`), CTEs, window functions |
| **AI Integration** | **Google Gemini API** (with local deterministic fallback) | Semantic resume parsing, keyword extraction, ATS scoring, customized study roadmaps |
| **Analytics Tools** | **SQL, Python / Pandas, Java 17 Streams** | Deduplication, descriptive statistics, department benchmarking, recruiter rankings |
| **BI & Reporting** | **Tableau (`.twb`), Excel (`.xlsx`)** | Interactive data storytelling, executive KPI cards, dynamic Excel formulas |
| **DevOps & Cloud** | **Docker, Docker Compose, GitHub Actions** | Multi-container composition (App + MongoDB + MySQL), automated CI testing & linting |

---

## 🏛️ System Architecture & Database Separation

The architecture enforces clean workload isolation between high-frequency transactional operations and heavy analytical aggregations:

```text
                     Presentation Layer
        ┌───────────────────────────────────────────┐
        │   Next.js 16 / React 19 Web Interface     │
        │   - Personal Dashboard (App Funnel)       │
        │   - Application Tracker (CRM Pipeline)    │
        │   - AI Skill Gap Analyzer (PDF + Gemini)  │
        │   - Campus Placement Intelligence (Charts)│
        └─────────────────────┬─────────────────────┘
                              │ HTTPS / REST
                              ▼
                     Application API Layer
        ┌───────────────────────────────────────────┐
        │   Express.js Modular REST Backend (5001)   │
        │   - JWT Authentication & RBAC Middleware  │
        │   - Zod Input Validation & Error Handling │
        │   - Multer In-Memory PDF Parsing          │
        └──────────────┬─────────────────────┬──────┘
                       │                     │
      Mongoose Queries │                     │ mysql2 Connection Pool
                       ▼                     ▼
              Operational Database   Analytics Database
              ┌──────────────────┐   ┌──────────────────┐
              │     MongoDB      │   │      MySQL       │
              │ (Port 27017)     │   │ (Port 3306/3307) │
              │ - Users          │   │ - raw_placement  │
              │ - Internships    │   │   (825 rows)     │
              │ - Placements     │   │ - placement_rec  │
              │ - Resumes & AI   │   │   (800 rows)     │
              │ - Applications   │   └──────────────────┘
              └──────────────────┘
```

---

## 📁 Repository Structure

```text
internship-placement-intelligence-platform/
├── backend/                                   # Express.js REST API
│   ├── src/
│   │   ├── server.js                         # Server bootstrap & DB connection verification
│   │   ├── app.js                            # Express app configuration & route registration
│   │   ├── modules/
│   │   │   ├── auth/                         # User registration, login, JWT token issuance
│   │   │   ├── applications/                 # CRM application tracker and interview rounds
│   │   │   ├── analyzer/                     # Resume upload, PDF extraction, Gemini LLM
│   │   │   └── analytics/                    # Personal summary metrics & MySQL intelligence API
│   │   └── shared/
│   │       ├── models/                       # Mongoose models (User, Internship, Placement, Resume, App)
│   │       ├── utils/                        # MongoDB connection & MySQL connection pool
│   │       └── middleware/                   # JWT authentication & global error handling
│   ├── Dockerfile                            # Multi-stage container build
│   └── package.json                          # Backend scripts and dependencies
│
├── frontend/                                  # Next.js 16 web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js                       # Personal application analytics dashboard
│   │   │   ├── applications/page.js          # Application Tracker pipeline view
│   │   │   ├── analyzer/page.js              # Resume ↔ JD Skill Gap Analyzer
│   │   │   ├── intelligence/page.js          # Campus Placement Intelligence Dashboard
│   │   │   ├── login/page.js                 # Candidate authentication
│   │   │   └── register/page.js              # Student account registration
│   │   └── utils/api.js                      # Centralized authenticated API client
│   ├── Dockerfile                            # Next.js production build container
│   └── package.json                          # Frontend dependencies (React 19, Chart.js)
│
├── Placement & Internship Intelligence/       # Data Analytics Suite
│   ├── Data/
│   │   ├── raw_placement_data.csv            # Raw dataset with duplicates & anomalies (825 records)
│   │   └── placement_data.csv                # Cleaned dataset (800 student records)
│   ├── SQL/
│   │   ├── data_cleaning.sql                 # Deduplication (ROW_NUMBER) & CASE standardization
│   │   ├── analysis_queries.sql              # 8 core business & KPI queries
│   │   └── setup_mysql.js                    # Automated MySQL seeding & verification script
│   ├── Java/
│   │   └── PlacementAnalytics.java           # Pure Java 17 Streams descriptive analytics engine
│   ├── Python/
│   │   └── placement_analysis.ipynb          # 7-step Pandas EDA & visualization notebook
│   ├── Tableau/
│   │   └── placement_dashboard.twb           # Interactive Tableau workbook (4 KPIs, 3 charts)
│   ├── Excel/
│   │   └── placement_report.xlsx             # Formatted workbook with dynamic Excel formulas
│   └── Dashboard/
│       └── index.html                        # Standalone offline dark-themed HTML dashboard
│
├── docs/                                      # Enterprise Documentation
│   ├── PRD.md                                # Product Requirements Document
│   ├── PROJECT_CONTEXT.md                    # Engineering architecture context & roadmap
│   ├── architecture.md                       # Multi-tier system design specifications
│   ├── database.md                           # Database design, schemas & SQL normalization
│   ├── api-spec.md                           # Complete REST API specification
│   ├── progress.md                           # 11-Phase engineering progress tracking
│   ├── AWS_DEPLOYMENT.md                     # AWS deployment guide (EC2, S3, RDS, Atlas)
│   └── VERCEL_RENDER_DEPLOYMENT.md           # Cloud PaaS deployment guide
│
├── docker-compose.yml                         # Multi-container orchestration (App + Mongo + MySQL)
└── README.md                                  # Project overview & documentation
```

---

## 📊 Analytics Pipeline & Benchmark Results

The analytics pipeline cleans messy raw campus placement data using beginner-friendly SQL window functions and calculates key institutional benchmarks:

```text
Raw Records (825) ───[ data_cleaning.sql ]───► Cleaned Records (800)
- 25 Duplicate Student IDs                      - Deduplicated via ROW_NUMBER() OVER (...)
- Inconsistent branch names (CSE, CS, Mech)    - Standardized via CASE WHEN
- Unplaced salary entries                       - Sanitized to NULL
```

### Verified SQL KPI Benchmarks:

| Business Metric | Target Benchmark | MySQL Result | Verification Status |
| :--- | :---: | :---: | :---: |
| **Total Enrolled Students** | 800 | **800** | ✅ Verified |
| **Total Placed Students** | 644 | **644** | ✅ Verified |
| **Campus Placement Rate** | 80.50% | **80.50%** | ✅ Verified |
| **Average CTC Package** | 10.99 LPA | **10.99 LPA** | ✅ Verified |
| **Highest CTC Package** | 34.56 LPA | **34.56 LPA** | ✅ Verified |
| **Computer Science (CSE)** | ~85.4% | **85.41%** (240/281) | ✅ Verified |
| **Information Technology (IT)** | ~84.4% | **84.39%** (173/205) | ✅ Verified |
| **Electronics & Comm (ECE)** | ~76.5% | **76.47%** (117/153) | ✅ Verified |
| **Mechanical Engineering** | ~75.3% | **75.26%** (73/97) | ✅ Verified |
| **Civil Engineering** | ~64.1% | **64.06%** (41/64) | ✅ Verified |
| **Students With Internship** | 89.7% | **89.73%** (524/584) | ✅ Verified |
| **Students Without Internship** | 55.6% | **55.56%** (120/216) | ✅ Verified |
| **Internship Placement Advantage** | +34.1% | **+34.17 percentage points** | ✅ Verified |

---

## 🚀 Running the Project Locally

### 1. Prerequisites
* **Node.js** v18+ and **npm** v9+
* **MongoDB** (running on `mongodb://localhost:27017`)
* **MySQL Server** (running on port `3306` or `3307`)
* **Java 17+** (optional, for Java analytics engine)
* **Python 3.10+** (optional, for Jupyter notebook)

### 2. Configure Environment Variables
Create or verify `backend/.env`:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=my_super_secret_key
JWT_EXPIRES_IN=7d

# MongoDB - Application Database
MONGODB_URI=mongodb://127.0.0.1:27017/internship_platform

# MySQL - Analytics Database
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=placement_analytics
MYSQL_PORT=3307

# Optional: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialize & Verify MySQL Analytics Database
Run the automated script to create `placement_analytics`, seed the 825 raw records, execute `data_cleaning.sql`, and verify all SQL KPIs:
```bash
cd backend
npm run db:mysql:setup
```

### 4. Start the Express Backend API
```bash
cd backend
npm install
npm start
# Express runs on http://localhost:5001
```

### 5. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
# Next.js runs on http://localhost:3000
```

### 6. Run Pure Java 17 Analytics Engine (CLI)
```bash
javac -d "Placement & Internship Intelligence/Java" "Placement & Internship Intelligence/Java/PlacementAnalytics.java"
java -cp "Placement & Internship Intelligence/Java" analytics.PlacementAnalytics
```

### 7. Run with Docker Compose
To launch the entire stack (Next.js + Express + MongoDB + MySQL) with a single command:
```bash
docker compose up -d --build
```

---

## 🎯 Key Application Endpoints

* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **Campus Placement Intelligence**: [http://localhost:3000/intelligence](http://localhost:3000/intelligence)
* **Application Tracker**: [http://localhost:3000/applications](http://localhost:3000/applications)
* **AI Skill Gap Analyzer**: [http://localhost:3000/analyzer](http://localhost:3000/analyzer)
* **Backend Health Check**: [http://localhost:5001](http://localhost:5001)
* **Cohort Intelligence API**: [http://localhost:5001/api/v1/analytics/intelligence](http://localhost:5001/api/v1/analytics/intelligence)

---

## 📄 License
This project is licensed under the ISC License.