# Campus Placement & Internship Intelligence Platform

An end-to-end beginner **Data Analytics project** designed to analyze campus placement outcomes across **SQL, Python, Excel, and Tableau**, backed by a lightweight Java analytics engine and an interactive dashboard.

---

## 🎯 Project Overview & Analytics Pipeline

This project demonstrates the complete beginner Data Analyst project workflow from raw, messy campus data to actionable business insights:

```text
Raw Placement Data (825 records)
        │
        ▼
[SQL Data Cleaning] ───────── Deduplication (ROW_NUMBER) & Department Standardization (CASE WHEN)
        │
        ▼
Cleaned Dataset (800 records)
        │
        ├──────────────────────┬──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼                      ▼
[SQL Analysis]          [Python / Pandas]       [Excel Report]         [Tableau Dashboard]
- 6 Core Business       - Verification & EDA    - 4 Key KPIs           - 4 KPI Metric Cards
  Queries                 (isnull, describe,    - Pivot Tables &       - 3 Core Visual Charts
- Conversion & Salary     value_counts)           Formulas             - 2 Interactive Filters
  Breakdowns            - Matplotlib Bar Chart  - Top Recruiter Table
        │                      │                      │                      │
        └──────────────────────┴──────────────────────┴──────────────────────┘
                                       │
                                       ▼
                       [Placement Business Insights]
                       - 80.5% Overall Placement Rate
                       - +34.1% Internship Placement Advantage
                       - CSE & IT Leading at ~85% Placement
```

---

## 📁 Repository Structure

```text
Placement & Internship Intelligence/
├── Data/
│   ├── raw_placement_data.csv       # Raw data with duplicates & variations (825 records)
│   └── placement_data.csv           # Cleaned dataset (800 student records)
│
├── SQL/
│   ├── data_cleaning.sql            # Deduplication (ROW_NUMBER) and CASE standardization (MySQL)
│   ├── analysis_queries.sql         # Core analytical and business queries (MySQL)
│   └── setup_mysql.js               # Automated MySQL placement_analytics setup & validation script
│
├── Python/
│   └── placement_analysis.ipynb     # Simple 7-step Pandas EDA & visualization notebook
│
├── Excel/
│   └── placement_report.xlsx        # Summary KPIs, Department table, Top Recruiters, Raw Data
│
├── Tableau/
│   └── placement_dashboard.twb      # Single-page dashboard (4 KPIs, 3 charts, 2 filters)
│
├── Java/
│   └── PlacementAnalytics.java      # Pure Java 17 descriptive analytics engine (zero-dependency)
│
└── Dashboard/
    ├── index.html                   # Clean, human-made dark UI dashboard
    └── data.js                      # Cleaned 800-record JSON dataset
```

---

## 📊 Dataset Dictionary (`placement_data.csv`)

The dataset contains exactly **10 clean columns** representing individual student academic profiles and placement results:

| Column | Data Type | Description |
| :--- | :--- | :--- |
| `Student_ID` | String | Unique identifier (`STU0001` - `STU0800`) |
| `Department` | String | Academic branch (`Computer Science & Engineering`, `Information Technology`, `Electronics & Communication`, `Mechanical Engineering`, `Civil Engineering`) |
| `Graduation_Year` | Integer | Cohort graduation year (`2023`, `2024`, `2025`, `2026`) |
| `CGPA` | Decimal | Cumulative Grade Point Average (`6.0` to `9.9`) |
| `Internship` | String | Prior internship experience (`Yes` or `No`) |
| `Placement_Status` | String | Final campus placement outcome (`Placed` or `Unplaced`) |
| `Company` | String | Recruiting employer (e.g., `TCS`, `Infosys`, `Google`, `Amazon`, or `NULL`) |
| `Job_Role` | String | Offered designation (e.g., `Software Engineer`, `Data Analyst`, or `NULL`) |
| `Salary_LPA` | Decimal | Annual salary package in Lakhs Per Annum (`NULL` if unplaced) |
| `Location` | String | Placement job location (e.g., `Bangalore`, `Hyderabad`, `Pune`, or `NULL`) |

---

## 🧹 Data Quality Issues Handled in Cleaning

The raw dataset intentionally incorporates **3 common real-world data quality issues**:
1. **Duplicate Records**: 25 duplicate student records (825 raw records → 800 clean records).
2. **Inconsistent Department Names**: Abbreviated values such as `CS`, `CSE`, `Mech`, and `ECE` are standardized to their official names using `CASE WHEN`.
3. **Missing / NULL Values**: Unplaced students correctly have `NULL` values for `Company`, `Job_Role`, `Salary_LPA`, and `Location`.

---

## 🛠️ Tooling & Technical Components

### 1. SQL Layer
- **`data_cleaning.sql`**:
  - Uses `ROW_NUMBER() OVER (PARTITION BY Student_ID ORDER BY Student_ID)` within a CTE to identify and filter out duplicate entries.
  - Standardizes department names using clean `CASE WHEN` logic.
  - Inserts 800 validated rows into `placement_records`.
- **`analysis_queries.sql`**:
  - **Query 1**: Overall Placement Rate & Average Package (`COUNT`, `SUM`, `CASE WHEN`, `AVG`).
  - **Query 2**: Placement Rate by Department (`GROUP BY`, `ORDER BY DESC`).
  - **Query 3**: Average Salary by Department (`AVG(Salary_LPA)` filtering placed students).
  - **Query 4**: Placement Rate: Internship vs. No Internship.
  - **Query 5**: Placement Rate by CGPA Tier (Tier 1 `9+`, Tier 2 `8-8.99`, Tier 3 `<8`).
  - **Query 6**: Top 5 Hiring Companies by Student Volume (`LIMIT 5`).

### 2. Python / Pandas Layer (`placement_analysis.ipynb`)
Contains 7 clean, beginner-friendly steps:
1. Load dataset with `pd.read_csv()`.
2. Inspect shape (`(800, 10)`) and column types.
3. Check missing values with `.isnull().sum()`.
4. Verify zero duplicates with `.duplicated().sum()`.
5. Summary statistics for numerical fields with `.describe()`.
6. Categorical frequency distributions using `.value_counts()`.
7. Aggregations using `.groupby()` and a simple Matplotlib bar chart.

### 3. Excel Report (`placement_report.xlsx`)
- **Summary Sheet**:
  - 4 KPI cards: **Total Students (800)**, **Placed Students (644)**, **Placement Rate (80.5%)**, and **Average Salary (10.99 LPA)**.
  - Department breakdown table using `COUNTA`, `COUNTIF`, `COUNTIFS`, and `AVERAGEIFS`.
  - Internship impact table (`Yes` vs. `No`).
- **Top Companies Sheet**: Table of recruiters ranked by hiring count.
- **Data Sheet**: Complete 800 clean records.

### 4. Tableau Dashboard (`placement_dashboard.twb`)
- **4 KPI Cards**: Total Students, Placed Students, Placement Rate, Average Salary.
- **3 Visualizations**:
  1. Placement Rate by Department (Bar Chart).
  2. Average Salary by Department (Bar Chart).
  3. Placement Trend by Graduation Year (Line Chart).
- **2 Quick Filters**: Department and Graduation Year.

### 5. Java Descriptive Engine (`PlacementAnalytics.java`)
Zero-dependency Java 17 script using standard Java Collections and Streams API to parse CSV data and output descriptive metrics directly to the console.

---

## 📈 Key Business Findings

1. **Internship Multiplier**: Students with prior internship experience achieved an **89.7% placement rate** compared to **55.6%** for students without internships (**+34.1% difference**).
2. **Department Performance**: **Computer Science (85.4%)** and **Information Technology (84.4%)** lead the campus in placement conversions, followed by ECE (76.5%), Mechanical (75.3%), and Civil (64.1%).
3. **Recruiter Distribution**: Mass recruiters (**TCS, Accenture, Infosys, Wipro**) account for over 45% of total hires, while tier-1 product firms offer the highest packages up to **34.56 LPA**.
