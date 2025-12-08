import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudents = (classId?: string) => {
  return useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("students")
          .select(`
            *,
            classes:class_id (
              id,
              name
            ),
            departments:department_id (
              id,
              name
            )
          `)
          .order("full_name");

        if (classId) {
          query = query.eq("class_id", classId);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Students query error:", error);
          if (error.code === "406" || error.code === "PGRST116") {
            console.warn("Students table not found - migrations may not be executed");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching students:", error);
        return [];
      }
    },
    staleTime: 60000,
  });
};

export const useStudent = (studentId: string) => {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select(`
            *,
            classes:class_id (
              id,
              name
            )
          `)
          .eq("id", studentId)
          .single();

        if (error) {
          console.error("Student query error:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
      }
    },
    enabled: !!studentId,
    staleTime: 60000,
  });
};
