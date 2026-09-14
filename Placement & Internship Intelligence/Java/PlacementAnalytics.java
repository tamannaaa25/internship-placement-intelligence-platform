package analytics;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class PlacementAnalytics {

    public static class StudentRecord {
        public String studentId;
        public String department;
        public int graduationYear;
        public double cgpa;
        public boolean hasInternship;
        public boolean isPlaced;
        public String company;
        public String jobRole;
        public Double salaryLpa;
        public String location;

        public static StudentRecord fromCsvLine(String line) {
            List<String> tokens = parseCsvLine(line);
            if (tokens.size() < 10) return null;

            StudentRecord r = new StudentRecord();
            r.studentId = tokens.get(0).trim();
            
            String rawDept = tokens.get(1).trim();
            if (rawDept.equalsIgnoreCase("CSE") || rawDept.equalsIgnoreCase("Computer Science") || rawDept.equalsIgnoreCase("CS")) {
                r.department = "Computer Science & Engineering";
            } else if (rawDept.equalsIgnoreCase("IT") || rawDept.equalsIgnoreCase("Info Tech") || rawDept.equalsIgnoreCase("Information Technology")) {
                r.department = "Information Technology";
            } else if (rawDept.equalsIgnoreCase("ECE") || rawDept.equalsIgnoreCase("Electronics") || rawDept.equalsIgnoreCase("Electronics & Communication")) {
                r.department = "Electronics & Communication";
            } else if (rawDept.equalsIgnoreCase("Mech") || rawDept.equalsIgnoreCase("Mechanical") || rawDept.equalsIgnoreCase("Mechanical Engineering")) {
                r.department = "Mechanical Engineering";
            } else if (rawDept.equalsIgnoreCase("Civil") || rawDept.equalsIgnoreCase("Civil Engg") || rawDept.equalsIgnoreCase("Civil Engineering")) {
                r.department = "Civil Engineering";
            } else {
                r.department = rawDept;
            }

            try {
                r.graduationYear = Integer.parseInt(tokens.get(2).trim());
            } catch (Exception e) {
                r.graduationYear = 2024;
            }

            try {
                r.cgpa = Double.parseDouble(tokens.get(3).trim());
            } catch (Exception e) {
                r.cgpa = 0.0;
            }

            r.hasInternship = tokens.get(4).trim().equalsIgnoreCase("Yes");
            r.isPlaced = tokens.get(5).trim().equalsIgnoreCase("Placed");
            r.company = tokens.get(6).trim();
            r.jobRole = tokens.get(7).trim();

            try {
                r.salaryLpa = tokens.get(8).trim().isEmpty() ? null : Double.parseDouble(tokens.get(8).trim());
            } catch (Exception e) {
                r.salaryLpa = null;
            }

            r.location = tokens.get(9).trim();
            return r;
        }

        private static List<String> parseCsvLine(String line) {
            List<String> list = new ArrayList<>();
            StringBuilder sb = new StringBuilder();
            boolean inQuotes = false;
            for (char c : line.toCharArray()) {
                if (c == '\"') {
                    inQuotes = !inQuotes;
                } else if (c == ',' && !inQuotes) {
                    list.add(sb.toString());
                    sb.setLength(0);
                } else {
                    sb.append(c);
                }
            }
            list.add(sb.toString());
            return list;
        }
    }

    public static void main(String[] args) {
        String csvPath = "Placement & Internship Intelligence/Data/placement_data.csv";
        if (args.length > 0) {
            csvPath = args[0];
        }

        System.out.println("============================================================================");
        System.out.println("     CAMPUS PLACEMENT & INTERNSHIP INTELLIGENCE PLATFORM (JAVA ENGINE)     ");
        System.out.println("============================================================================\n");

        List<StudentRecord> rawRecords = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(csvPath))) {
            String header = br.readLine();
            String line;
            while ((line = br.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    StudentRecord r = StudentRecord.fromCsvLine(line);
                    if (r != null) rawRecords.add(r);
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading CSV file at: " + csvPath);
            e.printStackTrace();
            return;
        }

        Map<String, StudentRecord> deduplicatedMap = new LinkedHashMap<>();
        for (StudentRecord r : rawRecords) {
            deduplicatedMap.putIfAbsent(r.studentId, r);
        }
        List<StudentRecord> students = new ArrayList<>(deduplicatedMap.values());

        int totalStudents = students.size();
        long placedCount = students.stream().filter(s -> s.isPlaced).count();
        double placementRate = (placedCount * 100.0) / totalStudents;

        List<Double> placedSalaries = students.stream()
                .filter(s -> s.isPlaced && s.salaryLpa != null)
                .map(s -> s.salaryLpa)
                .sorted()
                .collect(Collectors.toList());

        double avgSalary = placedSalaries.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double maxSalary = placedSalaries.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);

        long internCount = students.stream().filter(s -> s.hasInternship).count();
        double internshipRate = (internCount * 100.0) / totalStudents;

        System.out.println("┌──────────────────────────────────────────────────────────────────────────┐");
        System.out.println("│                          EXECUTIVE KPI OVERVIEW                          │");
        System.out.println("├─────────────────────────────┬────────────────────────────────────────────┤");
        System.out.printf("│ Total Enrolled Students     │ %-42d │%n", totalStudents);
        System.out.printf("│ Total Placed Students       │ %-42d │%n", placedCount);
        System.out.printf("│ Campus Placement Rate       │ %-41.2f%% │%n", placementRate);
        System.out.printf("│ Average Salary Package      │ %-38.2f LPA │%n", avgSalary);
        System.out.printf("│ Highest Salary Package      │ %-38.2f LPA │%n", maxSalary);
        System.out.printf("│ Student Internship Rate     │ %-41.2f%% │%n", internshipRate);
        System.out.println("└─────────────────────────────┴────────────────────────────────────────────┘\n");

        System.out.println("▶ 1. DEPARTMENT PERFORMANCE & PLACEMENT BENCHMARK");
        System.out.printf("%-32s | %-8s | %-7s | %-12s | %-12s%n", "Department", "Students", "Placed", "Placement %", "Avg CTC (LPA)");
        System.out.println("---------------------------------+----------+---------+--------------+--------------");

        Map<String, List<StudentRecord>> byDept = students.stream().collect(Collectors.groupingBy(s -> s.department));
        byDept.entrySet().stream()
                .sorted((a, b) -> {
                    double rA = (a.getValue().stream().filter(s -> s.isPlaced).count() * 100.0) / a.getValue().size();
                    double rB = (b.getValue().stream().filter(s -> s.isPlaced).count() * 100.0) / b.getValue().size();
                    return Double.compare(rB, rA);
                })
                .forEach(e -> {
                    String dept = e.getKey();
                    int total = e.getValue().size();
                    long placed = e.getValue().stream().filter(s -> s.isPlaced).count();
                    double rate = (placed * 100.0) / total;
                    double ctc = e.getValue().stream()
                            .filter(s -> s.isPlaced && s.salaryLpa != null)
                            .mapToDouble(s -> s.salaryLpa)
                            .average().orElse(0.0);
                    System.out.printf("%-32s | %-8d | %-7d | %10.2f%%  | %10.2f LPA%n", dept, total, placed, rate, ctc);
                });
        System.out.println();

        System.out.println("▶ 2. IMPACT OF PRIOR INTERNSHIP EXPERIENCE");
        long internTotal = students.stream().filter(s -> s.hasInternship).count();
        long internPlaced = students.stream().filter(s -> s.hasInternship && s.isPlaced).count();
        double internRate = (internPlaced * 100.0) / internTotal;
        double internAvgCtc = students.stream()
                .filter(s -> s.hasInternship && s.isPlaced && s.salaryLpa != null)
                .mapToDouble(s -> s.salaryLpa)
                .average().orElse(0.0);

        long nonInternTotal = totalStudents - internTotal;
        long nonInternPlaced = students.stream().filter(s -> !s.hasInternship && s.isPlaced).count();
        double nonInternRate = (nonInternPlaced * 100.0) / nonInternTotal;
        double nonInternAvgCtc = students.stream()
                .filter(s -> !s.hasInternship && s.isPlaced && s.salaryLpa != null)
                .mapToDouble(s -> s.salaryLpa)
                .average().orElse(0.0);

        System.out.printf("  • Students With Internship    : %d students | %d placed (%.2f%%) | Avg Package: %.2f LPA%n",
                internTotal, internPlaced, internRate, internAvgCtc);
        System.out.printf("  • Students Without Internship : %d students | %d placed (%.2f%%) | Avg Package: %.2f LPA%n",
                nonInternTotal, nonInternPlaced, nonInternRate, nonInternAvgCtc);
        System.out.printf("  ➤ Placement Advantage: +%.2f%% higher likelihood and +%.2f LPA higher starting CTC for intern alumni.%n%n",
                (internRate - nonInternRate), (internAvgCtc - nonInternAvgCtc));

        System.out.println("▶ 3. TOP HIRING RECRUITERS (BY VOLUME)");
        System.out.printf("%-20s | %-12s | %-14s%n", "Company", "Total Hires", "Avg Package");
        System.out.println("---------------------+--------------+---------------");
        Map<String, List<StudentRecord>> byCompany = students.stream()
                .filter(s -> s.isPlaced && !s.company.isEmpty())
                .collect(Collectors.groupingBy(s -> s.company));

        byCompany.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .limit(5)
                .forEach(e -> {
                    String comp = e.getKey();
                    int count = e.getValue().size();
                    double avg = e.getValue().stream().filter(s -> s.salaryLpa != null).mapToDouble(s -> s.salaryLpa).average().orElse(0.0);
                    System.out.printf("%-20s | %-12d | %10.2f LPA%n", comp, count, avg);
                });
        System.out.println();

        System.out.println("============================================================================");
        System.out.println("Analytics completed successfully using standard Java 17 Streams & Aggregations.");
        System.out.println("============================================================================");
    }
}
