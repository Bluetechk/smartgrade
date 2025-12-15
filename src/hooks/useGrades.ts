import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useGrades = (classSubjectId?: string, period?: string) => {
  return useQuery({
    queryKey: ["grades", classSubjectId, period],
    queryFn: async () => {
      // If user is a teacher (and not admin), ensure they can only query grades for their class_subjects
      const { user } = useAuth();
      if (user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        const isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
        const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
        if (isTeacher && !isAdmin && classSubjectId) {
          // Verify the class_subject is assigned to this teacher
          const { data: cs } = await supabase.from("class_subjects").select("teacher_id").eq("id", classSubjectId).single();
          if (!cs || cs.teacher_id !== user.id) {
            return [] as any[];
          }
        }
      }

      let query = supabase
        .from("student_grades")
        .select(`
          *,
          students:student_id (
            id,
            full_name,
            student_id
          ),
          assessment_types:assessment_type_id (
            id,
            name,
            max_points
          )
        `)
        .order("created_at", { ascending: false });

      if (classSubjectId) {
        query = query.eq("class_subject_id", classSubjectId);
      }

      if (period) {
        // Cast enum column to text to avoid Postgres operator mismatch
        query = (query as any).eq("period::text", period);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return data;
    },
    enabled: !!classSubjectId && !!period,
  });
};

export const useSaveGrades = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (grades: any[]) => {
      console.log("[useSaveGrades] Saving grades:", grades.length, "records");
      console.log("[useSaveGrades] Grade data sample:", JSON.stringify(grades[0], null, 2));
      
      // Use the database function to handle upsert with proper enum handling
      // The supabase client expects the parameter to match the function signature
      const { data, error } = await supabase.rpc('upsert_student_grades', {
        p_grades: grades  // This will be automatically converted to JSONB by the client
      });

      if (error) {
        console.error("[useSaveGrades] Error saving grades:", error);
        const errAny = error as any;
        console.error("[useSaveGrades] Error details:", {
          message: errAny?.message ?? null,
          status: errAny?.status ?? errAny?.statusCode ?? null,
          code: errAny?.code ?? null,
          details: errAny?.details ?? null,
        });
        throw error;
      }

      // Log and normalize results: RPC now returns aggregated totals (from student_period_totals), not individual assessments
      const rows = (data as any[]) || [];
      const savedRows = rows.filter(r => r && r.id);
      const diagnosticRows = rows.filter(r => r && (!r.id || r.diagnostics)).map(r => ({ student_id: r.student_id, class_subject_id: r.class_subject_id, period: r.period, total_score: r.total_score, diagnostics: r.diagnostics }));

      console.log("[useSaveGrades] Success! Saved", savedRows.length, "subject-period totals (aggregated from individual assessments)");
      if (diagnosticRows.length > 0) console.warn("[useSaveGrades] RPC diagnostics:", diagnosticRows);

      return rows;
    },
    onSuccess: (data) => {
      console.log("[useSaveGrades] RPC returned:", data);

      // Interpret returned rows: diagnostic rows contain null id and `diagnostics` text
      const rows = (data as any[]) || [];
      const savedRows = rows.filter(r => r && r.id);
      const diagnosticRows = rows.filter(r => r && (!r.id || r.diagnostics));

      if (rows.length === 0) {
        console.warn("[useSaveGrades] ⚠️ RPC returned empty array - no rows returned from function");
        toast({
          title: "Warning",
          description: "Grades were sent but the server returned no rows. Check Supabase function deployment and logs.",
          variant: "destructive",
        });
        return;
      }

      if (savedRows.length === 0) {
        console.warn("[useSaveGrades] ⚠️ No aggregated totals saved. Diagnostic rows:", diagnosticRows);
        toast({
          title: "Warning",
          description: "Grades were sent but none were saved. Check diagnostics in console for reasons (missing student/subject/assessment_type).",
          variant: "destructive",
        });
        return;
      }

      // Invalidate any query whose key starts with "grades" so views refresh
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "grades",
      });
      
      toast({
        title: "Success",
        description: `Grades saved successfully (${savedRows.length} subject-period totals, aggregated from assessments)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAssessmentTypes = (departmentId?: string) => {
  return useQuery({
    queryKey: ["assessment-types", departmentId],
    queryFn: async () => {
      let query = supabase
        .from("assessment_types")
        .select("*");

      // Filter by department if provided
      if (departmentId) {
        query = query.eq("department_id", departmentId);
      }

      query = query.order("display_order");

      const { data, error } = await query;

      if (error) {
        console.error("Assessment types query error:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!departmentId,
    staleTime: 60000,
  });
};
