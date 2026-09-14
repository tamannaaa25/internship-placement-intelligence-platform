# Database Architecture: MongoDB (Operational) + MySQL (Analytics)

This document details the two-database architecture, entity schemas, data cleaning methodology, and SQL analytical query patterns for the **Internship & Placement Intelligence Platform**.

---

## 1. Database Architecture: Strict Two-Database Separation

The platform utilizes a clean separation of concerns between operational transactional data and analytical reporting:

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

1. **MongoDB + Mongoose (Operational Application Database):**
   - Stores real-time application data: student users, authentication credentials, internships, student placement outcomes, uploaded resumes, and AI-driven skill gap analyses.
   - High-write throughput, flexible document structures, and rich subdocument embedding.

2. **MySQL + SQL (Data Analytics Database):**
   - Houses the analytical staging tables: `raw_placement_records` (825 records with intentional data-quality anomalies) and `placement_records` (800 validated cohort records).
   - Runs standard SQL queries for institutional dashboards, descriptive statistics, department benchmarking, and recruiter intelligence.

> [!IMPORTANT]
> **No PostgreSQL or SQLite**: The project exclusively employs MongoDB for the web application and MySQL for data analytics.

---

## 2. MongoDB Data Models (Mongoose)

### 2.1 User Model (`User.js`)
Stores candidate identity, credentials, academic profile, and role:
```javascript
{
  studentId: String,       // Unique student identifier (e.g. STU1042)
  name: String,            // Full student name
  email: String,           // Unique, indexed email address
  password: String,        // Bcrypt-hashed password
  department: String,      // Academic engineering department
  graduationYear: Number,  // Graduation year (e.g. 2025)
  cgpa: Number,            // Cumulative GPA (0.0 - 10.0)
  role: String,            // "STUDENT" | "ADMIN"
  timestamps: true
}
```

### 2.2 Internship Model (`Internship.js`)
Tracks student prior internships and industrial experience:
```javascript
{
  student: ObjectId,       // References User._id
  company: String,         // Internship organization
  role: String,            // Domain designation
  status: String,          // "Completed" | "Ongoing" | "Offered"
  duration: String,        // e.g. "3 Months"
  stipend: Number,         // Monthly stipend (INR)
  timestamps: true
}
```

### 2.3 Placement Model (`Placement.js`)
Maintains campus placement offer details:
```javascript
{
  student: ObjectId,       // References User._id
  placementStatus: String, // "Placed" | "Unplaced"
  company: String,         // Recruiting employer
  jobRole: String,         // Designation
  salaryLpa: Number,       // Annual CTC (LPA)
  location: String,        // Job location city
  timestamps: true
}
```

### 2.4 Resume & AI Analysis Model (`Resume.js`)
Stores candidate resumes and Gemini ATS gap analyses:
```javascript
{
  student: ObjectId,       // References User._id
  fileName: String,        // Original uploaded PDF filename
  fileUrl: String,         // Storage URL or file path
  extractedSkills: [String],
  analyses: [{
    jobDescriptionText: String,
    matchScore: Number,    // ATS Match (0 to 100)
    matchedSkills: [String],
    missingSkills: [String],
    roadmapSteps: Mixed,   // Actionable study roadmap
    createdAt: Date
  }],
  timestamps: true
}
```

### 2.5 Application & Rounds Model (`Application.js`)
Tracks student application lifecycle and multi-round interviews:
```javascript
{
  userId: ObjectId,        // References User._id
  companyName: String,     // Target company
  roleTitle: String,       // Target job role
  jobUrl: String,
  salary: Number,
  location: String,
  domain: String,          // e.g. "Software Engineering"
  status: String,          // "APPLIED" | "OA_SCHEDULED" | "OA_COMPLETED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "WITHDRAWN"
  appliedDate: Date,
  deadline: Date,
  rounds: [{
    roundName: String,     // e.g. "Technical Round 1"
    scheduledAt: Date,
    interviewerName: String,
    rating: Number,        // 1 to 5
    notes: String,
    timestamps: true
  }],
  timestamps: true
}
```

---

## 3. MySQL Analytics Schema (`placement_analytics`)

### 3.1 Raw Table: `raw_placement_records`
Contains 825 raw records including intentional data anomalies:
```sql
CREATE TABLE raw_placement_records (
    Student_ID VARCHAR(20),
    Department VARCHAR(100),
    Graduation_Year INT,
    CGPA DECIMAL(3, 2),
    Internship VARCHAR(10),
    Placement_Status VARCHAR(20),
    Company VARCHAR(100),
    Job_Role VARCHAR(100),
    Salary_LPA DECIMAL(4, 2),
    Location VARCHAR(100)
);
```

### 3.2 Cleaned Table: `placement_records`
Contains the 800 deduplicated and standardized records:
```sql
CREATE TABLE placement_records (
    Student_ID VARCHAR(20) PRIMARY KEY,
    Department VARCHAR(50) NOT NULL,
    Graduation_Year INT NOT NULL,
    CGPA DECIMAL(3, 2) NOT NULL,
    Internship VARCHAR(5) NOT NULL,
    Placement_Status VARCHAR(20) NOT NULL,
    Company VARCHAR(100),
    Job_Role VARCHAR(100),
    Salary_LPA DECIMAL(4, 2),
    Location VARCHAR(100)
);
```

---

## 4. SQL Data Cleaning Pipeline (`data_cleaning.sql`)

The cleaning pipeline uses beginner-friendly SQL to address 3 intentional data quality issues:

1. **Duplicate Detection & Elimination:**
   Uses `ROW_NUMBER() OVER (PARTITION BY Student_ID ORDER BY Student_ID)` within a CTE to eliminate the 25 duplicate rows.
2. **Department Standardization:**
   Uses a clean `CASE WHEN` to standardize variations (`CSE`, `Computer Science`, `Mech`, etc.) into 5 official departments:
   - Computer Science & Engineering
   - Information Technology
   - Electronics & Communication
   - Mechanical Engineering
   - Civil Engineering
3. **Null Handling:**
   Unplaced students receive `NULL` for `Company`, `Job_Role`, `Salary_LPA`, and `Location`.

```sql
INSERT INTO placement_records (
    Student_ID, Department, Graduation_Year, CGPA,
    Internship, Placement_Status, Company, Job_Role, Salary_LPA, Location
)
WITH DeduplicatedRecords AS (
    SELECT 
        Student_ID,
        CASE 
            WHEN TRIM(Department) IN ('CSE', 'Computer Science', 'CS') 
                THEN 'Computer Science & Engineering'
            WHEN TRIM(Department) IN ('IT', 'Info Tech', 'Information Technology') 
                THEN 'Information Technology'
            WHEN TRIM(Department) IN ('ECE', 'Electronics', 'Electronics & Communication') 
                THEN 'Electronics & Communication'
            WHEN TRIM(Department) IN ('Mech', 'Mechanical', 'Mechanical Engineering') 
                THEN 'Mechanical Engineering'
            WHEN TRIM(Department) IN ('Civil', 'Civil Engg', 'Civil Engineering') 
                THEN 'Civil Engineering'
            ELSE TRIM(Department)
        END AS Department,
        Graduation_Year,
        CGPA,
        CASE 
            WHEN LOWER(TRIM(Internship)) IN ('yes', 'y', '1', 'true') THEN 'Yes'
            ELSE 'No'
        END AS Internship,
        CASE 
            WHEN LOWER(TRIM(Placement_Status)) IN ('placed', 'p', 'yes') THEN 'Placed'
            ELSE 'Unplaced'
        END AS Placement_Status,
        CASE 
            WHEN LOWER(TRIM(Placement_Status)) IN ('placed', 'p', 'yes') AND Company IS NOT NULL AND Company != ''
                THEN TRIM(Company)
            ELSE NULL
        END AS Company,
        CASE 
            WHEN LOWER(TRIM(Placement_Status)) IN ('placed', 'p', 'yes') AND Job_Role IS NOT NULL AND Job_Role != ''
                THEN TRIM(Job_Role)
            ELSE NULL
        END AS Job_Role,
        CASE 
            WHEN LOWER(TRIM(Placement_Status)) IN ('placed', 'p', 'yes')
                THEN Salary_LPA
            ELSE NULL
        END AS Salary_LPA,
        CASE 
            WHEN LOWER(TRIM(Placement_Status)) IN ('placed', 'p', 'yes') AND Location IS NOT NULL AND Location != ''
                THEN TRIM(Location)
            ELSE NULL
        END AS Location,
        ROW_NUMBER() OVER (
            PARTITION BY Student_ID 
            ORDER BY Student_ID
        ) AS RowNum
    FROM raw_placement_records
    WHERE Student_ID IS NOT NULL AND TRIM(Student_ID) != ''
)
SELECT 
    Student_ID, Department, Graduation_Year, CGPA,
    Internship, Placement_Status, Company, Job_Role, Salary_LPA, Location
FROM DeduplicatedRecords
WHERE RowNum = 1;
```

---

## 5. Core SQL Analytical Queries & Expected Benchmarks

### Query 1: Executive KPI Overview
```sql
SELECT 
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary,
    MAX(Salary_LPA) AS max_salary
FROM placement_records;
```
* **Total Students**: 800
* **Placed Students**: 644
* **Placement Rate**: 80.50%
* **Average Salary**: 10.99 LPA
* **Highest Salary**: 34.56 LPA

### Query 2: Department Placement Benchmark
```sql
SELECT 
    Department,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate
FROM placement_records
GROUP BY Department
ORDER BY placement_rate DESC;
```
* **CSE**: 85.41% (240 / 281)
* **IT**: 84.39% (173 / 205)
* **ECE**: 76.47% (117 / 153)
* **Mechanical**: 75.26% (73 / 97)
* **Civil**: 64.06% (41 / 64)

### Query 4: Prior Internship Advantage
```sql
SELECT 
    Internship,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary
FROM placement_records
GROUP BY Internship
ORDER BY placement_rate DESC;
```
* **Internship = Yes**: 89.73% placed (524/584) | 11.52 LPA Avg CTC
* **Internship = No**: 55.56% placed (120/216) | 8.69 LPA Avg CTC
* **Advantage**: +34.17 percentage points higher placement rate for internship alumni.
