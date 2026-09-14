CREATE DATABASE IF NOT EXISTS placement_analytics;
USE placement_analytics;

DROP TABLE IF EXISTS raw_placement_records;

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

SELECT 
    Student_ID, 
    COUNT(*) AS record_count
FROM raw_placement_records
GROUP BY Student_ID
HAVING COUNT(*) > 1;

DROP TABLE IF EXISTS placement_records;

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

SELECT 
    (SELECT COUNT(*) FROM raw_placement_records) AS Raw_Count,
    (SELECT COUNT(*) FROM placement_records)     AS Cleaned_Count,
    ((SELECT COUNT(*) FROM raw_placement_records) - (SELECT COUNT(*) FROM placement_records)) AS Duplicates_Removed;

SELECT Department, COUNT(*) AS Student_Count
FROM placement_records
GROUP BY Department
ORDER BY Student_Count DESC;

SELECT COUNT(*) AS Invalid_Unplaced_Salaries
FROM placement_records
WHERE Placement_Status = 'Unplaced' AND Salary_LPA IS NOT NULL;
