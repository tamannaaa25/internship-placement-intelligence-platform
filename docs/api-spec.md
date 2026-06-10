# API Route Specifications

All backend REST API endpoints follow the `/api/v1` prefix. Payloads are exchanged in JSON format. Authenticated requests require a bearer token in the `Authorization` header.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### POST `/register`
Registers a new student.
* **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@college.edu",
    "password": "SecurePassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid-123",
      "name": "Jane Doe",
      "email": "jane@college.edu",
      "role": "STUDENT"
    }
  }
  ```

### POST `/login`
Authenticates user and returns JWT token.
* **Payload**:
  ```json
  {
    "email": "jane@college.edu",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid-123",
      "name": "Jane Doe",
      "email": "jane@college.edu",
      "role": "STUDENT"
    }
  }
  ```

---

## 2. Application Tracker Endpoints (`/api/v1/applications`)
*(Requires JWT Authentication Header: `Authorization: Bearer <token>`)*

### GET `/`
Retrieves all applications tracked by the authenticated user.
* **Query Parameters (Optional)**: `status`, `search`, `limit`, `offset`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "applications": [
      {
        "id": "app-uuid",
        "companyName": "Google",
        "roleTitle": "Software Engineering Intern",
        "status": "APPLIED",
        "appliedDate": "2026-06-10T00:00:00Z",
        "deadline": "2026-07-01T00:00:00Z"
      }
    ]
  }
  ```

### POST `/`
Creates a new job application log.
* **Payload**:
  ```json
  {
    "companyName": "Google",
    "roleTitle": "Software Engineering Intern",
    "jobUrl": "https://careers.google.com/...",
    "salary": 120000,
    "location": "Bangalore",
    "domain": "Software Engineering",
    "status": "APPLIED",
    "appliedDate": "2026-06-10T00:00:00Z"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "application": { "id": "app-uuid", ... }
  }
  ```

---

## 3. Resume Analyzer Endpoints (`/api/v1/analyzer`)
*(Requires JWT Authentication Header)*

### POST `/analyze`
Uploads a resume file and compares it against a job description.
* **Request (Multipart/form-data)**:
  - `resume`: File upload (PDF format)
  - `jobDescription`: String field containing JD text
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "analysis": {
      "matchScore": 78,
      "matchedSkills": ["JavaScript", "React", "Node.js"],
      "missingSkills": ["Docker", "PostgreSQL", "System Design"],
      "roadmap": [
        {
          "skill": "Docker",
          "topics": ["Containers vs VMs", "Dockerfile syntax", "Docker Compose"],
          "resources": ["Docker Official Guide", "FreeCodeCamp Crash Course"]
        }
      ]
    }
  }
  ```

---

## 4. Analytics Dashboard Endpoints (`/api/v1/analytics`)
*(Requires JWT Authentication Header)*

### GET `/summary`
Fetches high-level metrics for dashboard graphs.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "metrics": {
      "totalApplications": 42,
      "conversionRates": {
        "oaToInterview": 64.5,
        "interviewToOffer": 23.1
      },
      "domainsBreakdown": [
        { "domain": "Software Engineering", "count": 25 },
        { "domain": "DevOps", "count": 10 }
      ],
      "monthlyTrends": [
        { "month": "May", "count": 12 },
        { "month": "June", "count": 30 }
      ]
    }
  }
  ```
