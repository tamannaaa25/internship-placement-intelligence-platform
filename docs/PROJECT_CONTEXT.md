# Project Context: Internship & Placement Intelligence Platform

This document serves as the project state and context tracker for the Internship & Placement Intelligence Platform. It outlines the current state, tech stack details, active phase, and technical guidelines.

---

## 1. Project Identity & Purpose
* **Project Name**: Internship & Placement Intelligence Platform
* **Description**: A production-grade web application helping 3rd-year CS students manage internship/placement cycles, perform resume gap analysis using AI, and view application tracking analytics.
* **Mentorship Role**: Simulated Senior Engineer & Technical Coach mentoring a student intern.

---

## 2. Tech Stack Details
* **Frontend**: Next.js, React, Tailwind CSS (Empty folder initialized, to be built in Phase 6).
* **Backend**: Node.js, Express.js (Initialized, `server.js` and `app.js` present).
* **ORM & Database**: Prisma Client with PostgreSQL.
* **Authentication**: JWT & Role-Based Access Control (RBAC) (Pending implementation).
* **APIs**: REST APIs built using Express controllers.
* **AI Analysis**: Google Gemini API integration (Mock fallback available).
* **DevOps**: Docker, GitHub Actions, AWS EC2, S3, RDS (Pending implementation).

---

## 3. Active Phase & Focus
* **Active Phase**: Phase 9 - AWS Deployment (In Progress)
* **Current Task**: Setup AWS RDS database instances, configure S3 buckets, and map EC2 host ports.
* **Next Phase**: Phase 10 - CI/CD.

---

## 4. Current Directory Structure
```
internship-placement-intelligence-platform/
├── .git/
├── .github/
├── .gitignore
├── README.md
├── docs/                   # Central repository for documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── USER_STORIES.md     # User Stories & Acceptance Criteria
│   ├── PROJECT_CONTEXT.md  # Project status tracker
│   ├── architecture.md     # Architecture specifications
│   ├── database.md         # Database design
│   ├── api-spec.md         # API route contracts
│   └── progress.md         # Phase execution checklist
├── backend/
│   ├── .env                # Env variables
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma.config.ts
│   ├── prisma/
│   │   └── schema.prisma   # Prisma DB schema
│   └── src/
│       ├── server.js       # Entry point
│       ├── app.js          # Express app configurations
│       ├── config/         # System configs
│       ├── modules/        # Module-specific logic (e.g., auth)
│       └── shared/         # Reusable middlewares/errors/utils
├── frontend/               # Next.js web application (empty structure)
└── infrastructure/         # Docker/Cloud formation scripts (empty structure)
```

---

## 5. Branching & Commit Guidelines
As defined in the PRD, we follow:
* **Branch strategy**: GitFlow-Lite (`main`, `develop`, `feature/*`, `bugfix/*`).
* **Commit strategy**: Conventional Commits (e.g., `feat(tracker): add interview round`).
