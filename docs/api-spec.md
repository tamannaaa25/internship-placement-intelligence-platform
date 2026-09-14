# REST API Route Specifications & Contracts

**Base URL:** `/api/v1`  
**Data Format:** JSON (`application/json`) / Multipart Form (`multipart/form-data`)  
**Authentication:** Bearer Token via HTTP Header: `Authorization: Bearer <JWT_TOKEN>`  
**Response Wrapper:** Standardized JSON with `{ "success": boolean, "data": ... }` or `{ "success": false, "error": { "message": string } }`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### 1.1 Register Student (`POST /auth/register`)
Creates a new student account.
* **Request Body:**
  ```json
  {
    "name": "Aditya Sharma",
    "email": "aditya@university.edu",
    "password": "StrongPassword123!"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "c1f72b9a-4c2d-4e92-95f1-3bfb120f2621",
      "name": "Aditya Sharma",
      "email": "aditya@university.edu",
      "role": "STUDENT"
    }
  }
  ```

### 1.2 Login Student (`POST /auth/login`)
Authenticates credentials and issues a signed JWT.
* **Request Body:**
  ```json
  {
    "email": "aditya@university.edu",
    "password": "StrongPassword123!"
  }
  ```
* **Success Response (200 OK):** Returns JWT token and user profile object.

---

## 2. Application Tracker Endpoints (`/api/v1/applications`)

### 2.1 List Applications (`GET /applications`)
Fetches all applications for the authenticated candidate with optional query filtering.
* **Query Parameters:**
  * `status` (optional): `APPLIED`, `OA_SCHEDULED`, `INTERVIEWING`, `OFFER`, `REJECTED`
  * `domain` (optional): `SWE`, `DevOps`, `Data`, `Product`
  * `sort` (optional): `deadline_asc`, `applied_desc`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "applications": [
      {
        "id": "a98e21bc-1234-4567-89ab-cdef01234567",
        "companyName": "Google",
        "roleTitle": "Software Engineer Intern",
        "domain": "SWE",
        "status": "INTERVIEWING",
        "salary": "32.00",
        "location": "Bangalore",
        "appliedDate": "2026-08-15T00:00:00.000Z",
        "deadline": "2026-09-30T00:00:00.000Z",
        "roundsCount": 2
      }
    ]
  }
  ```

### 2.2 Create Application (`POST /applications`)
Registers a new application record.
* **Request Body:**
  ```json
  {
    "companyName": "Microsoft",
    "roleTitle": "Cloud Solutions Associate",
    "domain": "Cloud",
    "status": "APPLIED",
    "jobUrl": "https://careers.microsoft.com/job/123",
    "salary": 20.5,
    "location": "Hyderabad",
    "deadline": "2026-10-15T23:59:59.000Z"
  }
  ```
* **Success Response (201 Created):** Returns the persisted application object.

### 2.3 Add Interview Round (`POST /applications/:id/rounds`)
Appends an interview round to an existing application.
* **Request Body:**
  ```json
  {
    "roundName": "Technical Round 1 (DSA & System Design)",
    "roundOrder": 1,
    "scheduledDate": "2026-09-18T10:00:00.000Z",
    "interviewer": "Senior Engineering Lead",
    "feedback": "Asked binary trees and rate limiting algorithms.",
    "rating": 4
  }
  ```
* **Success Response (201 Created):** Returns the round details with parent linkage.

---

## 3. Resume ↔ JD Skill Gap Analyzer Endpoints (`/api/v1/analyzer`)

### 3.1 Analyze Resume against Job Description (`POST /analyzer/analyze`)
* **Content-Type:** `multipart/form-data`
* **Form Fields:**
  * `resume`: File buffer (PDF, max 5MB)
  * `jobDescription`: String (target job description, min 50 characters)
  * `targetRole`: String (e.g., "Full Stack Developer")
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "analysis": {
      "atsScore": 82,
      "summary": "Strong core fundamentals in JavaScript and backend architecture. Missing distributed caching and Docker experience.",
      "matchedSkills": ["JavaScript", "Node.js", "Express.js", "MongoDB", "MySQL", "REST APIs"],
      "missingSkills": ["Docker", "Redis", "AWS S3", "Kubernetes"],
      "roadmap": [
        {
          "step": 1,
          "title": "Containerization Fundamentals",
          "action": "Learn Docker multi-stage builds and compose local multi-container setups.",
          "estimatedHours": 8
        },
        {
          "step": 2,
          "title": "In-Memory Caching",
          "action": "Implement Redis cache on top of database queries to reduce DB load.",
          "estimatedHours": 6
        }
      ]
    }
  }
  ```

---

## 4. Analytics & Intelligence Endpoints (`/api/v1/analytics`)

### 4.1 Personal Preparation Summary (`GET /analytics/summary`)
Returns the student's individual recruitment funnel metrics.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "metrics": {
      "totalApplications": 48,
      "offers": 3,
      "rejections": 12,
      "interviewing": 6,
      "successRate": 6.3,
      "conversionRates": {
        "oaConversionRate": 58.3,
        "interviewConversionRate": 25.0
      },
      "skillReadinessScore": 78.4,
      "domainsBreakdown": [
        { "domain": "SWE", "count": 28 },
        { "domain": "DevOps", "count": 12 },
        { "domain": "Data Analyst", "count": 8 }
      ],
      "monthlyTrends": [
        { "month": "Aug 2026", "count": 18 },
        { "month": "Sep 2026", "count": 30 }
      ]
    }
  }
  ```

### 4.2 Campus Placement Intelligence (`GET /analytics/intelligence`)
Aggregates campus placement benchmarks across the 800-student cohort.
* **Query Parameters:**
  * `department` (optional): `Computer Science & Engineering`, `Information Technology`, etc.
  * `year` (optional): `2023`, `2024`, `2025`, `2026`
  * `status` (optional): `Placed`, `Unplaced`
  * `internship` (optional): `Yes`, `No`
  * `role` (optional): `Software Engineer`, `Data Analyst`, etc.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "kpis": {
      "total": 800,
      "placedCount": 644,
      "placementRate": 80.5,
      "avgSalary": 10.99,
      "maxSalary": 34.56,
      "internRate": 73.0
    },
    "count": 800,
    "records": [...]
  }
  ```

---

## 5. HTTP Error Code Standards

| HTTP Code | Error Type | Scenario |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Validation Error | Payload missing required fields or failing Zod schema. |
| **`401 Unauthorized`** | Authentication Failure | Missing, malformed, or expired JWT bearer token. |
| **`403 Forbidden`** | Authorization Failure | Student attempting to access another user's private data. |
| **`404 Not Found`** | Resource Missing | Application ID or resume record does not exist. |
| **`413 Payload Too Large`** | File Size Limit | Uploaded resume exceeds the 5MB boundary. |
| **`500 Internal Server Error`** | Unhandled Exception | Database connection failure or unhandled service crash. |
