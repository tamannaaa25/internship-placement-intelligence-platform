USE placement_analytics;

-- Query 1: Executive KPI Overview
SELECT 
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary,
    MAX(Salary_LPA) AS max_salary,
    MIN(Salary_LPA) AS min_salary
FROM placement_records;

-- Query 2: Placement Rate by Department
SELECT 
    Department,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate
FROM placement_records
GROUP BY Department
ORDER BY placement_rate DESC;

-- Query 3: Average and Highest CTC by Department
SELECT 
    Department,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary,
    MAX(Salary_LPA) AS max_salary
FROM placement_records
WHERE Placement_Status = 'Placed'
GROUP BY Department
ORDER BY avg_salary DESC;

-- Query 4: Impact of Prior Internship Experience
SELECT 
    Internship,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary
FROM placement_records
GROUP BY Internship
ORDER BY placement_rate DESC;

-- Query 4B: Internship Placement Rate Advantage (Percentage Points Difference)
SELECT 
    ROUND(
        (100.0 * COUNT(CASE WHEN Internship = 'Yes' AND Placement_Status = 'Placed' THEN 1 END) / COUNT(CASE WHEN Internship = 'Yes' THEN 1 END)) -
        (100.0 * COUNT(CASE WHEN Internship = 'No' AND Placement_Status = 'Placed' THEN 1 END) / COUNT(CASE WHEN Internship = 'No' THEN 1 END)),
        2
    ) AS internship_advantage_pct_points
FROM placement_records;

SELECT 
    CASE 
        WHEN CGPA >= 8.0 THEN 'High (>= 8.0)'
        WHEN CGPA >= 7.0 THEN 'Medium (7.0 - 7.9)'
        ELSE 'Low (< 7.0)'
    END AS cgpa_category,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) AS placed_students,
    ROUND(100.0 * COUNT(CASE WHEN Placement_Status = 'Placed' THEN 1 END) / COUNT(*), 2) AS placement_rate
FROM placement_records
GROUP BY 
    CASE 
        WHEN CGPA >= 8.0 THEN 'High (>= 8.0)'
        WHEN CGPA >= 7.0 THEN 'Medium (7.0 - 7.9)'
        ELSE 'Low (< 7.0)'
    END
ORDER BY placement_rate DESC;

SELECT 
    Company,
    COUNT(*) AS total_hires,
    ROUND(AVG(Salary_LPA), 2) AS avg_salary
FROM placement_records
WHERE Placement_Status = 'Placed' AND Company IS NOT NULL
GROUP BY Company
ORDER BY total_hires DESC
LIMIT 5;
