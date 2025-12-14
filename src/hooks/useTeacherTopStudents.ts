import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface TopStudent {
  id: string;
  name: string;
  average: number;
}

export const useTeacherTopStudents = (period?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-top-students", user?.id, period],
    queryFn: async (): Promise<TopStudent[]> => {
      if (!user) return [];

      try {
        // Get the teacher's sponsor class
        const { data: classList, error: classError } = await supabase
          .from("classes")
          .select("id")
          .eq("teacher_id", user.id);

        if (classError) throw classError;
        if (!classList || classList.length === 0) return [];

        const classId = classList[0].id;

        // Get all students in this class
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id, full_name")
          .eq("class_id", classId);

        if (studentsError) throw studentsError;
        const studentIds = students?.map((s: any) => s.id) || [];

        if (studentIds.length === 0) return [];

        // Get student grades for the period
        let gradesQuery: any = supabase
          .from("student_grades")
          .select(`
            score,
            max_score,
            student_id,
            students:student_id (
              id,
              full_name
            )
          `)
          .in("student_id", studentIds);

        if (period && ["p1", "p2", "p3", "p4", "p5", "p6", "exam_s1", "exam_s2", "semester1", "semester2", "yearly"].includes(period)) {
          // Cast enum column to text to avoid Postgres operator mismatch
          gradesQuery = gradesQuery.eq("period::text" as any, period as any);
        }

        const { data: grades, error: gradesError } = await gradesQuery;

        if (gradesError) throw gradesError;

        // Calculate average score per student
        const studentScores = new Map<string, { name: string; scores: number[] }>();

        grades?.forEach((grade: any) => {
          const studentId = grade.student_id;
          const studentName = grade.students?.full_name || "Unknown";
          const score = grade.score;
          const maxScore = grade.max_score || 100;
          const percentage = (score / maxScore) * 100;

          if (!studentScores.has(studentId)) {
            studentScores.set(studentId, { name: studentName, scores: [] });
          }
          studentScores.get(studentId)?.scores.push(percentage);
        });

        // Calculate averages and sort
        const topStudents: TopStudent[] = Array.from(studentScores.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            average: Math.round(
              data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            ),
          }))
          .sort((a, b) => b.average - a.average)
          .slice(0, 5);

        return topStudents;
      } catch (error) {
        console.error("Error fetching teacher top students:", error);
        return [];
      }
    },
    staleTime: 60000,
  });
};
