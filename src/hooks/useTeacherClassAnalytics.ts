import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface StudentDistributionBySubject {
  subjectName: string;
  count: number;
}

export interface SubjectPerformance {
  subjectName: string;
  averageScore: number;
  studentCount: number;
}

export interface GradeDistribution {
  gradeRange: string;
  count: number;
}

export interface TeacherClassAnalytics {
  studentDistributionBySubject: StudentDistributionBySubject[];
  subjectPerformance: SubjectPerformance[];
  gradeDistribution: GradeDistribution[];
  totalStudents: number;
  totalSubjects: number;
  averagePerformance: number;
  className: string;
}

export const useTeacherClassAnalytics = (period?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-class-analytics", user?.id, period],
    queryFn: async (): Promise<TeacherClassAnalytics> => {
      if (!user) {
        return {
          studentDistributionBySubject: [],
          subjectPerformance: [],
          gradeDistribution: [],
          totalStudents: 0,
          totalSubjects: 0,
          averagePerformance: 0,
          className: "",
        };
      }

      try {
        // Get the teacher's sponsor class
        const { data: classList, error: classError } = await supabase
          .from("classes")
          .select("id, name")
          .eq("teacher_id", user.id);

        if (classError) throw classError;
        if (!classList || classList.length === 0) {
          return {
            studentDistributionBySubject: [],
            subjectPerformance: [],
            gradeDistribution: [],
            totalStudents: 0,
            totalSubjects: 0,
            averagePerformance: 0,
            className: "No Class Assigned",
          };
        }

        const classId = classList[0].id;
        const className = classList[0].name;

        // Get all students in this class
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("class_id", classId);

        if (studentsError) throw studentsError;
        const studentIds = students?.map((s: any) => s.id) || [];
        const totalStudents = studentIds.length;

        if (totalStudents === 0) {
          return {
            studentDistributionBySubject: [],
            subjectPerformance: [],
            gradeDistribution: [],
            totalStudents: 0,
            totalSubjects: 0,
            averagePerformance: 0,
            className,
          };
        }

        // Get class subjects for this class
        const { data: classSubjects, error: classSubjectsError } = await supabase
          .from("class_subjects")
          .select(`
            id,
            subjects:subject_id (
              id,
              name
            )
          `)
          .eq("class_id", classId);

        if (classSubjectsError) throw classSubjectsError;
        const totalSubjects = classSubjects?.length || 0;

        // Map subject names to count
        const subjectDistributionMap = new Map<string, number>();
        const subjectPerformanceMap = new Map<string, { scores: number[]; count: number }>();

        classSubjects?.forEach((cs: any) => {
          const subjectName = cs.subjects?.name || "Unknown Subject";
          subjectDistributionMap.set(subjectName, totalStudents);
          subjectPerformanceMap.set(subjectName, { scores: [], count: 0 });
        });

        // Get grades for all students in this class
        const { data: grades, error: gradesError } = await supabase
          .from("student_grades")
          .select(`
            score,
            max_score,
            student_id,
            class_subjects:class_subject_id (
              subjects:subject_id (
                name
              )
            )
          `)
          .in("student_id", studentIds);

        if (gradesError) throw gradesError;

        // Process grades
        const allScores: number[] = [];
        grades?.forEach((grade: any) => {
          const score = grade.score;
          const maxScore = grade.max_score || 100;
          const percentage = (score / maxScore) * 100;
          const subjectName = grade.class_subjects?.subjects?.name || "Unknown Subject";

          allScores.push(percentage);

          const existing = subjectPerformanceMap.get(subjectName);
          if (existing) {
            existing.scores.push(percentage);
            existing.count += 1;
          }
        });

        // Calculate average performance
        const averagePerformance = allScores.length > 0 
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0;

        // Build subject performance
        const subjectPerformance: SubjectPerformance[] = Array.from(
          subjectPerformanceMap.entries()
        ).map(([subjectName, data]) => ({
          subjectName,
          averageScore: data.scores.length > 0 
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            : 0,
          studentCount: totalStudents,
        }));

        // Build grade distribution
        const gradeRanges = [
          { range: "A (90-100%)", min: 90, max: 100 },
          { range: "B (80-89%)", min: 80, max: 89 },
          { range: "C (70-79%)", min: 70, max: 79 },
          { range: "D (60-69%)", min: 60, max: 69 },
          { range: "F (0-59%)", min: 0, max: 59 },
        ];

        const gradeDistribution: GradeDistribution[] = gradeRanges.map((gr) => {
          const count = allScores.filter(s => s >= gr.min && s <= gr.max).length;
          return {
            gradeRange: gr.range,
            count,
          };
        });

        const studentDistributionBySubject: StudentDistributionBySubject[] = Array.from(
          subjectDistributionMap.entries()
        ).map(([subjectName, count]) => ({ subjectName, count }));

        return {
          studentDistributionBySubject,
          subjectPerformance,
          gradeDistribution,
          totalStudents,
          totalSubjects,
          averagePerformance,
          className,
        };
      } catch (error) {
        console.error("Error fetching teacher class analytics:", error);
        return {
          studentDistributionBySubject: [],
          subjectPerformance: [],
          gradeDistribution: [],
          totalStudents: 0,
          totalSubjects: 0,
          averagePerformance: 0,
          className: "Error loading class",
        };
      }
    },
    staleTime: 60000,
  });
};
