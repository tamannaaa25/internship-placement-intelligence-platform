# System Architecture Specifications

This document outlines the architectural patterns, data flow, component models, and scaling strategies for the Internship & Placement Intelligence Platform.

---

## 1. High-Level Architecture Overview
The platform is designed as a classic **n-tier decoupled architecture** consisting of:
1. **Presentation Layer**: Next.js single-page application (SPA) with server-side page optimization. React components styled with Tailwind CSS communicating asynchronously with the backend via RESTful endpoints.
2. **Application API Layer**: Node.js & Express.js REST service. Handles request validation, auth middleware verification, business logic processing, database queries via Prisma, and third-party integrations (e.g. Gemini LLM).
3. **Database Layer**: PostgreSQL database instances. Manages users, application logs, documents, and dashboard aggregations.
4. **Integration Layer**: AI analysis (via Gemini/OpenAI API) and file hosting (AWS S3) for resumes.

```
       +---------------------------------------------+
       |             Presentation Layer              |
       |               Next.js Web App               |
       +----------------------|----------------------+
                              | HTTPS REST
                              v
       +---------------------------------------------+
       |            Application API Layer            |
       |             Node.js / Express               |
       +------|-----------------------|-----------|--+
              | ORM                   | API       | SDK
              v                       v           v
+-------------|-------------+   +-----|-------+ +-|---------+
|      Database Layer       |   | AI Services | | Cloud S3 |
|    PostgreSQL / Prisma    |   | Gemini API  | | File Host |
+---------------------------+   +-------------+ +-----------+
```

---

## 2. Component Design (Decoupled Module Pattern)
The backend is structured around a **modular component architecture** inside the `backend/src/modules` folder. Each module operates as a self-contained feature pack:
* **Controllers**: Handle HTTP inputs, map parameters, validate request payloads, and return HTTP status codes.
* **Services**: Contain pure business logic (e.g., matching algorithm logic, token creation rules). They do not know about express `req` or `res`.
* **Repositories**: Responsible for database querying via Prisma. Isolates the database query interface from the business logic.
* **Routes**: Map endpoints to controllers and attach relevant middlewares.
* **Validators**: Schema validation utilizing the `zod` library.

---

## 3. Scale-Out Architecture
To prepare for system design interviews, the platform's scaling plan is designed as follows:

### Scenario A: 10 Active Users
* **Setup**: Single server instance (AWS EC2 micro) hosting both the Express backend and PostgreSQL database.
* **Bottlenecks**: Virtually none.
* **Focus**: Developer velocity and database schema accuracy.

### Scenario B: 1,000 Active Users
* **Setup**: Decouple the database from the application server. Use AWS RDS for PostgreSQL and a separate EC2/ECS instance for the backend.
* **Caching**: Introduce **Redis** to cache session tokens and static resources (like company lists or matching scores).
* **Connection Pooling**: Implement Prisma's built-in connection pooler or pgBouncer to handle active concurrent database connections.

### Scenario C: 100,000 Active Users (Production-Grade Scalability)
* **High Availability Layout**:
  - Deploy multiple instances of the backend API inside Docker containers, distributed across multiple Availability Zones (AZs) behind an **Application Load Balancer (ALB)**.
  - Set up an Auto-Scaling Group (ASG) based on CPU/Memory usage metrics.
* **Database Scaling**:
  - Configure PostgreSQL with **Read-Write Splitting**: 1 Primary database for write operations, and 2 Read Replicas to handle analytics dashboard metrics.
  - Implement partition tables for application notes/activity logs.
* **AI Analysis Queue (Asynchronous Processing)**:
  - Resume parser takes 2–5 seconds per PDF due to OCR and LLM processing times. Sync processing would block backend threads and cause client timeouts.
  - Solution: Push resume processing requests to a message queue (**RabbitMQ / AWS SQS**). A background worker pool (consumer) picks up files from S3, processes them with Gemini, and saves results to the database. The client polls the backend or receives a notification (via WebSockets) when the report is ready.
* **Caching & CDN**:
  - Store resumes on CloudFront-backed S3 buckets.
  - Cache heavy dashboard analytics queries in Redis with a Time-To-Live (TTL) of 1 hour to prevent hitting the database for static analytics.
