# Project Context: Internship & Placement Intelligence Platform

This document maintains project state, architectural context, tech stack specifications, and active phase information for the **Internship & Placement Intelligence Platform**.

---

## 1. Project Identity & Purpose
* **Project Name:** Internship & Placement Intelligence Platform
* **Target Audience:** 3rd/4th-Year Computer Science & Engineering students preparing for SWE, DevOps, Product, and Data Analyst roles.
* **Goal:** A production-grade, portfolio-defining platform combining a personal candidate CRM, an AI-powered resume skill diagnostic engine, personal preparation analytics, and macroeconomic campus placement intelligence.
* **Mentorship Mode:** Senior Software Engineer, Product Manager, System Design Mentor, and Code Reviewer guiding a student engineer.

---

## 2. Technology Stack

| Layer | Primary Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Chart.js | Modern, responsive dark UI, client-side dynamic filtering, interactive dashboard |
| **Backend API** | Node.js, Express.js | Modular RESTful API architecture, JWT authentication, validation, error handling |
| **Databases** | MongoDB (Application / Mongoose), MySQL (Analytics / SQL) | Operational application data, high-performance analytical queries |
| **Analytics & Data**| SQL (CTEs, Window Functions), Java 17 Streams, Python/Pandas | Data cleaning, deduplication, statistical benchmarking, descriptive analytics |
| **BI & Reporting** | Tableau (`.twb`), Excel (`.xlsx` with dynamic formulas) | Interactive data storytelling, executive charts, tabular exports |
| **AI Integration** | Google Gemini API (with local deterministic fallback) | Semantic resume parsing, skill extraction, ATS score computation, learning roadmaps |
| **DevOps & Cloud** | Docker, Docker Compose, GitHub Actions, AWS EC2, S3, RDS | Multi-stage container builds, automated CI/CD lint/test pipelines, cloud storage |

---

## 3. Active Phase & Development State

* **Active Phase:** Phase 1 - Product Requirements Document (PRD) & Workflow Setup
* **Current Status:** Phase 1 PRD formally approved, detailing 4 core product pillars including the newly integrated Campus Placement & Internship Intelligence Dashboard.
* **Immediate Milestone:** Phase 2 User Stories & Scenario Mapping (`docs/USER_STORIES.md`).

---

## 4. Complete Project Directory Structure

```text
internship-placement-intelligence-platform/
│
├── docs/                                     # Comprehensive engineering documentation
│   ├── PRD.md                                # Product Requirements Document (All 4 modules)
│   ├── USER_STORIES.md                       # User scenarios, acceptance criteria, edge cases
│   ├── PROJECT_CONTEXT.md                    # System state, tech stack, and setup reference
│   ├── architecture.md                       # High-level system design, data flows, scalability
│   ├── database.md                           # Schemas, ERD, normalization, indexing, SQL queries
│   ├── api-spec.md                           # OpenAPI-compliant REST endpoint contracts
│   ├── AWS_DEPLOYMENT.md                     # Production deployment manual for AWS EC2, RDS, S3
│   └── progress.md                           # 11-phase roadmap tracking and checklists
│
├── backend/                                  # Express.js REST API service
│   ├── src/
│   │   ├── app.js                            # Express application setup and middleware
│   │   ├── server.js                         # HTTP server initialization and port binding
│   │   ├── config/                           # Database and environment configurations
│   │   ├── modules/                          # Domain modules
│   │   │   ├── auth/                         # User registration, login, JWT issuance
│   │   │   ├── applications/                 # CRM application tracker and interview rounds
│   │   │   ├── analyzer/                     # Resume upload, PDF extraction, Gemini LLM
│   │   │   └── analytics/                    # Summary metrics and campus intelligence API
│   │   └── shared/models/                    # Mongoose models (User, Internship, Placement, Resume, Application)
│   └── Dockerfile                            # Multi-stage production container build
│
├── frontend/                                 # Next.js 16 responsive web client
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js                     # Root layout with font and metadata
│   │   │   ├── page.js                       # Main personal dashboard
│   │   │   ├── intelligence/page.js          # Campus Placement Intelligence Dashboard
│   │   │   ├── applications/page.js          # Application Tracker pipeline view
│   │   │   ├── analyzer/page.js              # Resume ↔ JD Skill Gap Analyzer
│   │   │   ├── login/page.js                 # Authentication login view
│   │   │   ├── register/page.js              # Student registration view
│   │   │   └── components/
│   │   │       └── SidebarLayout.js          # Global responsive sidebar navigation
│   │   └── data/placementData.json           # 800-record cohort dataset for reactive analytics
│   ├── public/downloads/                     # Downloadable deliverables (.xlsx, .twb, .sql, .java)
│   └── Dockerfile                            # Next.js production build container
│
├── Placement & Internship Intelligence/       # Standalone Data Analytics suite
│   ├── Data/                                 # Cleaned (800) & raw (825) placement datasets
│   ├── SQL/                                  # data_cleaning.sql & analysis_queries.sql
│   ├── Java/                                 # PlacementAnalytics.java (Pure Java 17 Streams)
│   ├── Python/                               # placement_analysis.ipynb (Descriptive pandas EDA)
│   ├── Tableau/                              # placement_dashboard.twb (5 KPIs, 7 charts, filters)
│   ├── Excel/                                # placement_report.xlsx (Dynamic formulas & charts)
│   ├── Dashboard/                            # Standalone offline HTML/Chart.js dashboard
│   └── README.md                             # Analytics project documentation
│
├── .github/workflows/
│   └── ci.yml                                # Automated CI testing and linting
├── docker-compose.yml                        # Multi-service local composition (App + DB)
└── README.md                                 # Top-level repository overview
```

---

## 5. Engineering Standards & Workflows
* **GitFlow-Lite:** Development occurs on `develop`, feature branches branch as `feature/<name>`, production releases on `main`.
* **Conventional Commits:** All commit messages strictly follow `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
* **Zero-Downtime Mentality:** Database changes managed via automated scripts and migrations; stateless backend services.
