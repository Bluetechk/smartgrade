import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStudents = (classId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["students", classId, user?.id],
    queryFn: async () => {
      try {
        let query = supabase
          .from("students")
          .select(`
            *,
            classes:class_id (
              id,
              name,
              teacher_id
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

        if (user) {
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
          const isTeacher = Array.isArray(roles) && roles.some((r: any) => r.role === "teacher");
          const isAdmin = Array.isArray(roles) && roles.some((r: any) => r.role === "admin");
          // Only filter if teacher AND not admin. Admins see all students.
          if (isTeacher && !isAdmin) {
            // If no classId provided, only return students for classes where teacher_id = user.id
            if (!classId) {
              // Filter via related classes table
              query = query.eq("classes.teacher_id", user.id);
            } else {
              // If classId provided, ensure that class belongs to this teacher; else return empty
              const { data: cls } = await supabase.from("classes").select("teacher_id").eq("id", classId).single();
              if (!cls || cls.teacher_id !== user.id) {
                return [] as any[];
              }
            }
          }
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
