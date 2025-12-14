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
        query = query.eq("period::text" as any, period as any);
      }

      const { data, error } = await query;
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
      const { data, error } = await supabase
        .from("student_grades")
        .upsert(grades, { onConflict: "id" })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast({
        title: "Success",
        description: "Grades saved successfully",
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
