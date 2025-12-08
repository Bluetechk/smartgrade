import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select(`
            *,
            departments:department_id (
              id,
              name
            ),
            academic_years:academic_year_id (
              id,
              year_name
            )
          `)
          .order("name");

        if (error) {
          console.error("Classes query error:", error);
          // Return empty array if table doesn't exist
          if (error.code === "406" || error.code === "PGRST116") {
            console.warn("Classes table not found - migrations may not be executed");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching classes:", error);
        return [];
      }
    },
    staleTime: 60000,
  });
};

export const useClassSubjects = (classId?: string) => {
  return useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("class_subjects")
          .select(`
            *,
            subjects:subject_id (
              id,
              name,
              code
            ),
            classes:class_id (
              id,
              name
            )
          `)
          .order("period_number");

        if (classId) {
          query = query.eq("class_id", classId);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Class subjects query error:", error);
          if (error.code === "406" || error.code === "PGRST116") {
            console.warn("Class subjects table not found - migrations may not be executed");
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching class subjects:", error);
        return [];
      }
    },
    enabled: !!classId,
    staleTime: 60000,
  });
};
