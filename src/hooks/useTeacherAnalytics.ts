import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type TeacherAnalytics = {
  totalStudents: number;
  passCount: number;
  failCount: number;
  atRiskCount: number;
  attentionCount: number;
  passRate: number; // percentage
  failRate: number;
  atRiskRate: number;
  attentionRate: number;
  topStudents: Array<{ student_id: string; full_name: string; percent: number }>;
};

export const useTeacherAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-analytics", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check roles
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
      const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
      if (!isTeacher || isAdmin) return null;

      // Get class_subject ids for this teacher
      const { data: classSubjects } = await supabase
        .from("class_subjects")
        .select("id, class_id")
        .eq("teacher_id", user.id);

      const classSubjectIds = (classSubjects || []).map((cs: any) => cs.id).filter(Boolean);
      const classIds = (classSubjects || []).map((cs: any) => cs.class_id).filter(Boolean);

      if (classSubjectIds.length === 0 && classIds.length === 0) {
        return {
          totalStudents: 0,
          passCount: 0,
          failCount: 0,
          atRiskCount: 0,
          attentionCount: 0,
          passRate: 0,
          failRate: 0,
          atRiskRate: 0,
          attentionRate: 0,
          topStudents: [],
        } as TeacherAnalytics;
      }

      // Fetch students in these classes
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name, student_id, class_id")
        .in("class_id", classIds.length ? classIds : [null]);

      const studentsList = students || [];
      const studentMap = new Map<string, { totalScore: number; totalMax: number; full_name: string }>();
      studentsList.forEach((s: any) => {
        studentMap.set(s.id, { totalScore: 0, totalMax: 0, full_name: s.full_name });
      });

      if (studentMap.size === 0) {
        return {
          totalStudents: 0,
          passCount: 0,
          failCount: 0,
          atRiskCount: 0,
          attentionCount: 0,
          passRate: 0,
          failRate: 0,
          atRiskRate: 0,
          attentionRate: 0,
          topStudents: [],
        } as TeacherAnalytics;
      }

      // Fetch all grades for these class_subjects (or classes) and aggregate per student
      const { data: grades } = await supabase
        .from("student_grades")
        .select("student_id, score, max_score, class_subject_id")
        .in("class_subject_id", classSubjectIds.length ? classSubjectIds : [null]);

      (grades || []).forEach((g: any) => {
        const sid = g.student_id;
        if (!studentMap.has(sid)) return;
        const entry = studentMap.get(sid)!;
        entry.totalScore += Number(g.score || 0);
        // prefer max_score if present, otherwise skip
        entry.totalMax += Number(g.max_score || 0);
      });

      // Compute percentages and metrics
      const results: Array<{ student_id: string; full_name: string; percent: number }> = [];
      studentMap.forEach((v, k) => {
        const percent = v.totalMax > 0 ? (v.totalScore / v.totalMax) * 100 : 0;
        results.push({ student_id: k, full_name: v.full_name, percent });
      });

      const totalStudents = results.length;
      const passThreshold = 50;
      const atRiskThreshold = 40;

      let passCount = 0;
      let failCount = 0;
      let atRiskCount = 0;
      let attentionCount = 0;

      results.forEach((r) => {
        if (r.percent >= passThreshold) passCount++;
        else failCount++;
        if (r.percent < atRiskThreshold) atRiskCount++;
        else if (r.percent < passThreshold) attentionCount++;
      });

      const passRate = totalStudents ? Math.round((passCount / totalStudents) * 100) : 0;
      const failRate = totalStudents ? Math.round((failCount / totalStudents) * 100) : 0;
      const atRiskRate = totalStudents ? Math.round((atRiskCount / totalStudents) * 100) : 0;
      const attentionRate = totalStudents ? Math.round((attentionCount / totalStudents) * 100) : 0;

      // Top 5 students
      const topStudents = results.sort((a, b) => b.percent - a.percent).slice(0, 5);

      return {
        totalStudents,
        passCount,
        failCount,
        atRiskCount,
        attentionCount,
        passRate,
        failRate,
        atRiskRate,
        attentionRate,
        topStudents,
      } as TeacherAnalytics;
    },
    staleTime: 30000,
  });
};
