# User Stories & Scenario Mapping

This document specifies the user stories, acceptance criteria, and technical edge cases for the Internship & Placement Intelligence Platform. These definitions serve as the source of truth for backend API implementation, frontend interface design, and testing.

---

## 1. Authentication & RBAC (Auth)

### US1: User Registration (Sign Up)
**As a** prospective student  
**I want to** register an account with my name, email, and password  
**So that** I can securely access the platform and store my tracking data.

* **Acceptance Criteria**:
  * **Given** a new email address, a user name, and a password matching security constraints (minimum 8 characters, at least one number and one uppercase letter), **when** I submit the registration request, **then** my account is created with the role `STUDENT`, my password is encrypted, and I am returned a valid JWT.
  * **Given** an email address that already exists in the system, **when** I attempt to register, **then** the request is rejected with a `409 Conflict` status and a clear message: `"Email is already registered"`.

### US2: User Login (Sign In)
**As a** registered student  
**I want to** authenticate using my credentials  
**So that** I can access my dashboard and secure endpoints.

* **Acceptance Criteria**:
  * **Given** correct credentials, **when** I log in, **then** I receive a JWT token and user profile metadata, and my session is marked as authenticated.
  * **Given** incorrect password or non-existent email, **when** I log in, **then** the system returns a `401 Unauthorized` status. **Security Rule**: The error message must be generic (e.g., `"Invalid email or password"`) to prevent email enumeration attacks.

### US3: Authorization (Role-Based Access Control)
**As an** administrator  
**I want** restricted routes to block non-admin users  
**So that** confidential student aggregate data is not compromised.

* **Acceptance Criteria**:
  * **Given** a request to admin endpoints, **when** authenticated as a user with the `STUDENT` role, **then** the system returns a `403 Forbidden` status.
  * **Given** a request to user resources (e.g., fetching a resume report), **when** the user is authenticated but attempts to fetch another user's data, **then** the system returns a `403 Forbidden` or `404 Not Found` (to hide resource existence).

---

## 2. Application Tracker Module (Tracker)

### US4: Add Job Application
**As a** student  
**I want to** record a new job application with details like company, role, deadline, and status  
**So that** I don't lose track of active opportunities.

* **Acceptance Criteria**:
  * **Given** valid application fields (Company Name: "Google", Role: "SWE Intern", Applied Date: today), **when** I save the application, **then** the record is persisted under my account and initialized with the selected status (default: `APPLIED`).
  * **Given** invalid input data (missing company name, or application deadline date set in the past relative to the applied date), **when** I save, **then** the system returns a `400 Bad Request` with field-specific validation errors.

### US5: Update Application Stage (Status Lifecycle)
**As a** student  
**I want to** transition an application's state (e.g., from `APPLIED` to `OA_SCHEDULED` or `REJECTED`)  
**So that** my active pipeline stays up-to-date.

* **Acceptance Criteria**:
  * **Given** an active application, **when** I change the status to `OA_SCHEDULED` or `INTERVIEWING`, **then** the database record is updated and the transition timestamp is recorded.
  * **Given** a change to `REJECTED` or `OFFER`, **when** I confirm the update, **then** the dashboard immediately reflects the updated conversion and success rates.

### US6: Manage Interview Rounds
**As a** student  
**I want to** log multiple interview rounds for a specific application, including interviewer details and questions asked  
**So that** I can review my interview details and learn from previous rounds.

* **Acceptance Criteria**:
  * **Given** an application in `INTERVIEWING` status, **when** I create an interview round, **then** I can specify round details (Round Type: e.g. "System Design", Interviewer: "John Doe", Date, Rating, Notes) and save it successfully.
  * **Given** multiple rounds, **when** I list the application details, **then** rounds are returned in chronological order.

---

## 3. Resume ↔ JD Skill Gap Analyzer (Analyzer)

### US7: Upload Resume and Paste Job Description
**As a** student preparing for interviews  
**I want to** upload my PDF resume and paste a job description text  
**So that** I can trigger a skill comparison.

* **Acceptance Criteria**:
  * **Given** a valid PDF file under 2MB and a non-empty Job Description text, **when** I submit the form, **then** the PDF text is extracted on the server, a call is made to the LLM API, and the results are compiled.
  * **Given** an invalid file type (e.g., `.png` or `.txt`) or a file exceeding 2MB, **when** I upload, **then** the system immediately rejects the request in the frontend and backend with a `400 Bad Request` and message: `"Only PDF resumes under 2MB are supported"`.

### US8: View Skill Match Report & Roadmap
**As a** student  
**I want to** see a match score, list of matching skills, missing skills, and learning resources  
**So that** I can target my preparation to match the job requirements.

* **Acceptance Criteria**:
  * **Given** a successful analyzer process, **when** the results load, **then** I see an ATS score from 0-100, lists of matched/missing skills, and a step-by-step learning roadmap.
  * **Given** that the LLM API is down or times out, **when** I trigger the analysis, **then** the system displays a friendly error message: `"AI Analysis failed. Please try again later."` without breaking the application, and the original resume file is safely stored on S3.

---

## 4. Analytics Dashboard Module (Analytics)

### US9: View Funnel Conversion Metrics
**As a** student  
**I want to** view a conversion funnel showing my transition rates from Applied → OA → Interview → Offer  
**So that** I can pinpoint which stage of the recruitment process I need to work on.

* **Acceptance Criteria**:
  * **Given** a student dashboard, **when** I load the analytics page, **then** the system calculates:
    - total applications.
    - success rate: `Offers / Total Applications * 100`.
    - interview conversion: `Interviews Attended / Applications * 100`.
  * **Given** a student with no applications logged, **when** the page loads, **then** it displays `0` for all metrics (handling potential divide-by-zero errors gracefully in code).

---

## 5. Technical Edge Cases & Error Handling Mapping

| Scenario | Risk | Mitigation Strategy | HTTP Status |
|:---|:---|:---|:---:|
| **Duplicate Email Sign-up** | Database constraint violation. | Pre-check email existence in service layer; handle unique constraint errors gracefully. | `409 Conflict` |
| **Invalid JWT Token** | Unauthorized resource access. | Return standardized error response and clear client-side local storage to force log in. | `401 Unauthorized` |
| **Expired JWT Token** | Student logged out mid-session. | Detect `TokenExpiredError` in middleware; frontend interceptor redirects to login page. | `401 Unauthorized` |
| **Past Dates in Deadlines** | Confusing user data. | Validate that the deadline is greater than or equal to the application date. | `400 Bad Request` |
| **Delete Application cascade** | Orphaned interview rounds. | Set up database cascading rules. If an application is deleted, automatically delete its associated interview rounds and notes. | `200 OK` |
| **Large Resume Upload (2MB+)** | Denial of Service (DoS) risk. | Set size limit middlewares (`multer` configurations) to drop requests early. | `413 Payload Too Large`|
| **AI LLM API Timeout** | Request timeout (Express hangs). | Implement a timeout handler (e.g. 8 seconds) for LLM API requests. If timed out, return fallback message. | `504 Gateway Timeout` |
| **Null Analytics Fields** | Divide-by-zero errors in charts. | Safeguard calculations: `let conversion = total === 0 ? 0 : (rounds / total) * 100`. | `200 OK` |
