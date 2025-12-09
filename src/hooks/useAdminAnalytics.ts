import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentDistributionByClass {
  className: string;
  count: number;
}

export interface StudentDistributionByDepartment {
  departmentName: string;
  count: number;
}

export interface ClassPerformance {
  className: string;
  averageScore: number;
  studentCount: number;
}

export interface GradeDistribution {
  gradeRange: string;
  count: number;
}

export interface AdminAnalytics {
  studentDistributionByClass: StudentDistributionByClass[];
  studentDistributionByDepartment: StudentDistributionByDepartment[];
  classPerformance: ClassPerformance[];
  gradeDistribution: GradeDistribution[];
  totalStudents: number;
  totalClasses: number;
  totalDepartments: number;
  averagePerformance: number;
}

export const useAdminAnalytics = (period?: string) => {
  return useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async (): Promise<AdminAnalytics> => {
      try {
        // Get all students with their classes and departments
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select(`
            id,
            class_id,
            department_id,
            classes:class_id (
              id,
              name
            ),
            departments:department_id (
              id,
              name
            )
          `);

        if (studentsError) {
          console.error("Students query error:", studentsError);
          throw studentsError;
        }

        // Calculate student distribution by class
        const classDistributionMap = new Map<string, number>();
        const departmentDistributionMap = new Map<string, number>();
        const classStudentMap = new Map<string, Set<string>>(); // className -> Set of student IDs

        students?.forEach((student: any) => {
          const className = student.classes?.name || "Unassigned";
          const departmentName = student.departments?.name || "Unassigned";
          
          // Count by class
          classDistributionMap.set(className, (classDistributionMap.get(className) || 0) + 1);
          
          // Count by department
          departmentDistributionMap.set(departmentName, (departmentDistributionMap.get(departmentName) || 0) + 1);
          
          // Track students per class for performance calculation
          if (!classStudentMap.has(className)) {
            classStudentMap.set(className, new Set());
          }
          classStudentMap.get(className)?.add(student.id);
        });

        const studentDistributionByClass: StudentDistributionByClass[] = Array.from(
          classDistributionMap.entries()
        ).map(([className, count]) => ({ className, count }));

        const studentDistributionByDepartment: StudentDistributionByDepartment[] = Array.from(
          departmentDistributionMap.entries()
        ).map(([departmentName, count]) => ({ departmentName, count }));

        // Get grades for performance analysis
        let gradesQuery = supabase
          .from("student_grades")
          .select(`
            score,
            max_score,
            student_id,
            students:student_id (
              classes:class_id (
                name
              )
            )
          `);

        if (period) {
          gradesQuery = gradesQuery.eq("period", period as any);
        }

        const { data: grades, error: gradesError } = await gradesQuery;

        if (gradesError) {
          console.error("Grades query error:", gradesError);
        }

        // Calculate class performance
        const classScoreMap = new Map<string, { total: number; max: number; count: number }>();
        
        grades?.forEach((grade: any) => {
          const className = grade.students?.classes?.name || "Unassigned";
          const existing = classScoreMap.get(className) || { total: 0, max: 0, count: 0 };
          
          classScoreMap.set(className, {
            total: existing.total + Number(grade.score || 0),
            max: existing.max + Number(grade.max_score || 0),
            count: existing.count + 1,
          });
        });

        const classPerformance: ClassPerformance[] = Array.from(classScoreMap.entries()).map(
          ([className, scores]) => ({
            className,
            averageScore: scores.max > 0 ? Math.round((scores.total / scores.max) * 100) : 0,
            studentCount: classStudentMap.get(className)?.size || 0,
          })
        ).sort((a, b) => b.averageScore - a.averageScore);

        // Calculate grade distribution
        const gradeRanges = [
          { range: "90-100", min: 90, max: 100, label: "A (90-100)" },
          { range: "80-89", min: 80, max: 89, label: "B (80-89)" },
          { range: "70-79", min: 70, max: 79, label: "C (70-79)" },
          { range: "60-69", min: 60, max: 69, label: "D (60-69)" },
          { range: "0-59", min: 0, max: 59, label: "F (0-59)" },
        ];

        // Calculate average per student first
        const studentAverages = new Map<string, number>();
        const studentGradeMap = new Map<string, { total: number; max: number }>();

        grades?.forEach((grade: any) => {
          const studentId = grade.student_id;
          const existing = studentGradeMap.get(studentId) || { total: 0, max: 0 };
          
          studentGradeMap.set(studentId, {
            total: existing.total + Number(grade.score || 0),
            max: existing.max + Number(grade.max_score || 0),
          });
        });

        studentGradeMap.forEach((scores, studentId) => {
          const average = scores.max > 0 ? (scores.total / scores.max) * 100 : 0;
          studentAverages.set(studentId, average);
        });

        // Distribute students into grade ranges
        const gradeDistributionCount = new Map<string, number>();
        gradeRanges.forEach((range) => {
          gradeDistributionCount.set(range.label, 0);
        });

        studentAverages.forEach((average) => {
          const range = gradeRanges.find((r) => average >= r.min && average <= r.max);
          if (range) {
            gradeDistributionCount.set(range.label, (gradeDistributionCount.get(range.label) || 0) + 1);
          }
        });

        const gradeDistribution: GradeDistribution[] = Array.from(gradeDistributionCount.entries()).map(
          ([gradeRange, count]) => ({ gradeRange, count })
        );

        // Calculate overall average performance
        const allScores = Array.from(studentAverages.values());
        const averagePerformance = allScores.length > 0
          ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
          : 0;

        // Get totals
        const { count: totalStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        const { count: totalClasses } = await supabase
          .from("classes")
          .select("*", { count: "exact", head: true });

        const { count: totalDepartments } = await supabase
          .from("departments")
          .select("*", { count: "exact", head: true });

        return {
          studentDistributionByClass,
          studentDistributionByDepartment,
          classPerformance,
          gradeDistribution,
          totalStudents: totalStudents || 0,
          totalClasses: totalClasses || 0,
          totalDepartments: totalDepartments || 0,
          averagePerformance,
        };
      } catch (error) {
        console.error("Admin analytics error:", error);
        return {
          studentDistributionByClass: [],
          studentDistributionByDepartment: [],
          classPerformance: [],
          gradeDistribution: [],
          totalStudents: 0,
          totalClasses: 0,
          totalDepartments: 0,
          averagePerformance: 0,
        };
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });
};

